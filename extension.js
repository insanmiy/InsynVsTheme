const vscode = require("vscode");
const path = require("path");
const os = require("os");
const fs = require("fs");

const THEME_NAMES = new Set(["Insyn Blue Midnight", "Insyn Blackout", "Insyn Vivid"]);
const UPDATE_DELAY_MS = 25;
const MAX_DOCUMENT_CHARS = 2_000_000_000;
const HIGHLIGHTED_COMMENT_LINE = /^[\t ]*(?:\/\/\.|#\.)[^\r\n]*/gm;

const GITHUB_REPO = "insanmiy/InsynVsTheme";
const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 Minutes

function isNewerVersion(latest, current) {
  const parse = (v) => v.replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
  const l = parse(latest);
  const c = parse(current);
  for (let i = 0; i < Math.max(l.length, c.length); i++) {
    const lPart = l[i] || 0;
    const cPart = c[i] || 0;
    if (lPart > cPart) return true;
    if (lPart < cPart) return false;
  }
  return false;
}

async function checkForUpdates(context, { manual = false } = {}) {
  const currentVersion = context.extension.packageJSON.version;
  const lastCheck = context.globalState.get("insynvstheme.lastUpdateCheck", 0);
  const now = Date.now();

  if (!manual && now - lastCheck < UPDATE_CHECK_INTERVAL_MS) {
    return;
  }

  await context.globalState.update("insynvstheme.lastUpdateCheck", now);

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: { "User-Agent": "InsynVsTheme-Updater" }
    });

    if (!response.ok) {
      if (manual) {
        vscode.window.showErrorMessage("Failed To Check For Updates: " + response.statusText);
      }
      return;
    }

    const release = await response.json();
    const latestVersion = (release.tag_name || "").replace(/^v/, "");

    if (!latestVersion || !isNewerVersion(latestVersion, currentVersion)) {
      if (manual) {
        vscode.window.showInformationMessage(`InsynVsTheme Is Up To Date (v${currentVersion}).`);
      }
      return;
    }

    const vsixAsset = (release.assets || []).find((a) => a.name && a.name.endsWith(".vsix"));
    if (!vsixAsset || !vsixAsset.browser_download_url) {
      if (manual) {
        vscode.window.showWarningMessage(`New Version v${latestVersion} Found, But No VSIX Package Was Attached.`);
      }
      return;
    }

    const performInstall = async (progress) => {
      if (progress) {
        progress.report({ message: "Downloading Update..." });
      }
      const downloadRes = await fetch(vsixAsset.browser_download_url, {
        headers: { "User-Agent": "InsynVsTheme-Updater" }
      });
      if (!downloadRes.ok) {
        throw new Error("Download Failed: " + downloadRes.statusText);
      }

      const buffer = Buffer.from(await downloadRes.arrayBuffer());
      const tempPath = path.join(os.tmpdir(), vsixAsset.name);
      fs.writeFileSync(tempPath, buffer);

      try {
        if (progress) {
          progress.report({ message: "Installing Package..." });
        }
        await vscode.commands.executeCommand("workbench.extensions.installExtension", vscode.Uri.file(tempPath));
      } finally {
        try {
          fs.unlinkSync(tempPath);
        } catch (_) { }
      }
    };

    if (manual) {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Updating InsynVsTheme To v${latestVersion}`,
          cancellable: false
        },
        performInstall
      );
    } else {
      await performInstall();
    }

    const choice = await vscode.window.showInformationMessage(
      `InsynVsTheme Has Been Updated To v${latestVersion}. Reload Window To Apply Changes?`,
      "Reload Window"
    );
    if (choice === "Reload Window") {
      vscode.commands.executeCommand("workbench.action.reloadWindow");
    }
  } catch (error) {
    if (manual) {
      vscode.window.showErrorMessage("Error Updating InsynVsTheme: " + (error.message || error));
    }
  }
}

function activate(context) {
  const pendingUpdates = new Map();
  const whiteComment = vscode.window.createTextEditorDecorationType({
    color: "#FFFFFF",
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
  });

  const themeIsActive = () =>
    THEME_NAMES.has(vscode.workspace.getConfiguration("workbench").get("colorTheme"));

  const updateEditor = (editor) => {
    if (!themeIsActive()) {
      editor.setDecorations(whiteComment, []);
      return;
    }

    const documentText = editor.document.getText();
    if (documentText.length > MAX_DOCUMENT_CHARS) {
      editor.setDecorations(whiteComment, []);
      return;
    }

    const ranges = [];
    HIGHLIGHTED_COMMENT_LINE.lastIndex = 0;

    for (const match of documentText.matchAll(HIGHLIGHTED_COMMENT_LINE)) {
      const markerOffset = match.index + match[0].search(/\S/);
      const endOffset = match.index + match[0].length;
      ranges.push(
        new vscode.Range(
          editor.document.positionAt(markerOffset),
          editor.document.positionAt(endOffset)
        )
      );
    }

    editor.setDecorations(whiteComment, ranges);
  };

  const updateVisibleEditors = () => {
    for (const editor of vscode.window.visibleTextEditors) {
      updateEditor(editor);
    }
  };

  const scheduleDocumentUpdate = (document) => {
    const key = document.uri.toString();
    const existingUpdate = pendingUpdates.get(key);
    if (existingUpdate) {
      clearTimeout(existingUpdate);
    }

    pendingUpdates.set(
      key,
      setTimeout(() => {
        pendingUpdates.delete(key);
        for (const editor of vscode.window.visibleTextEditors) {
          if (editor.document === document) {
            updateEditor(editor);
          }
        }
      }, UPDATE_DELAY_MS)
    );
  };

  const updateDocumentNow = (document) => {
    const key = document.uri.toString();
    const pendingUpdate = pendingUpdates.get(key);
    if (pendingUpdate) {
      clearTimeout(pendingUpdate);
      pendingUpdates.delete(key);
    }

    for (const editor of vscode.window.visibleTextEditors) {
      if (editor.document === document) {
        updateEditor(editor);
      }
    }
  };

  const markerMayHaveChanged = (event) =>
    event.contentChanges.some((change) => {
      if (/\r|\n/.test(change.text) || change.range.start.line !== change.range.end.line) {
        return true;
      }

      const changedLine = event.document.lineAt(change.range.start.line);
      return change.range.start.character <= changedLine.firstNonWhitespaceCharacterIndex + 3;
    });

  const cancelPendingUpdates = () => {
    for (const update of pendingUpdates.values()) {
      clearTimeout(update);
    }
    pendingUpdates.clear();
  };

  context.subscriptions.push(
    whiteComment,
    { dispose: cancelPendingUpdates },
    vscode.window.onDidChangeVisibleTextEditors(updateVisibleEditors),
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (!themeIsActive()) {
        return;
      }

      const isVisible = vscode.window.visibleTextEditors.some(
        (editor) => editor.document === event.document
      );
      if (isVisible) {
        if (markerMayHaveChanged(event)) {
          updateDocumentNow(event.document);
        } else {
          scheduleDocumentUpdate(event.document);
        }
      }
    }),
    vscode.workspace.onDidCloseTextDocument((document) => {
      const key = document.uri.toString();
      const pendingUpdate = pendingUpdates.get(key);
      if (pendingUpdate) {
        clearTimeout(pendingUpdate);
        pendingUpdates.delete(key);
      }
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("workbench.colorTheme")) {
        cancelPendingUpdates();
        updateVisibleEditors();
      }
    }),
    vscode.commands.registerCommand("insynvstheme.checkForUpdates", () => {
      return checkForUpdates(context, { manual: true });
    })
  );

  updateVisibleEditors();

  setTimeout(() => {
    checkForUpdates(context, { manual: false });
  }, 4000);

  const updateInterval = setInterval(() => {
    checkForUpdates(context, { manual: false });
  }, UPDATE_CHECK_INTERVAL_MS);

  context.subscriptions.push({
    dispose: () => clearInterval(updateInterval)
  });
}

function deactivate() { }

module.exports = { activate, deactivate };
