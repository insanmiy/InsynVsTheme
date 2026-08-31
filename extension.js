const vscode = require("vscode");

const THEME_NAME = "InsynVsTheme";
const UPDATE_DELAY_MS = 40;
const HIGHLIGHTED_COMMENT_LINE = /^[\t ]*(?:\/\/\.|#\.)[^\r\n]*/gm;

function activate(context) {
  const pendingUpdates = new Map();
  const whiteComment = vscode.window.createTextEditorDecorationType({
    color: "#FFFFFF",
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
  });

  const themeIsActive = () =>
    vscode.workspace.getConfiguration("workbench").get("colorTheme") === THEME_NAME;

  const updateEditor = (editor) => {
    if (!themeIsActive()) {
      editor.setDecorations(whiteComment, []);
      return;
    }

    const ranges = [];
    const documentText = editor.document.getText();
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
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("workbench.colorTheme")) {
        cancelPendingUpdates();
        updateVisibleEditors();
      }
    })
  );

  updateVisibleEditors();
}

function deactivate() {}

module.exports = { activate, deactivate };
