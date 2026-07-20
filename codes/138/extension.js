const vscode = require('vscode');

function activate(context) {
    let disposable = vscode.commands.registerCommand(
        'ridiculousCoding.hello',
        function () {
            vscode.window.showInformationMessage(
                'Welcome to Ridiculous Coding!'
            );
        }
    );

    context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};