const vscode = require("vscode");

const THEME_NAME = "InsynVsTheme";
const HIGHLIGHTED_COMMENT = /^\s*(?:\/\/\.|#\.)/;

function activate(context) {
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
    for (let lineNumber = 0; lineNumber < editor.document.lineCount; lineNumber += 1) {
      const line = editor.document.lineAt(lineNumber);
      if (HIGHLIGHTED_COMMENT.test(line.text)) {
        ranges.push(
          new vscode.Range(
            lineNumber,
            line.firstNonWhitespaceCharacterIndex,
            lineNumber,
            line.text.length
          )
        );
      }
    }

    editor.setDecorations(whiteComment, ranges);
  };

  const updateVisibleEditors = () => {
    for (const editor of vscode.window.visibleTextEditors) {
      updateEditor(editor);
    }
  };

  context.subscriptions.push(
    whiteComment,
    vscode.window.onDidChangeVisibleTextEditors(updateVisibleEditors),
    vscode.workspace.onDidChangeTextDocument((event) => {
      for (const editor of vscode.window.visibleTextEditors) {
        if (editor.document === event.document) {
          updateEditor(editor);
        }
      }
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("workbench.colorTheme")) {
        updateVisibleEditors();
      }
    })
  );

  updateVisibleEditors();
}

function deactivate() {}

module.exports = { activate, deactivate };
