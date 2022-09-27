// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const merger = require('./src/merger');
const simpleGit = require('simple-git');


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "salesforce-package-xml-power-tools" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('salesforce-package-xml-power-tools.mergePackages', async function (uri) {
		// The code you place here will be executed every time your command is executed
		console.log(uri);
		const workspacePath = vscode.workspace.workspaceFolders[0].uri;
		workspacePath._formatted = workspacePath._formatted + '/manifest';
		workspacePath._fsPath = workspacePath._fsPath + '\\manifest';
		workspacePath.path = workspacePath.path + '//manifest';
		var sourceFile;
		var destFile;
		if (uri) {
			sourceFile = [uri];
		} else {
			sourceFile = await vscode.window.showOpenDialog({
				filters: {
					'Package files (*.xml)': ['XML']
				},
				canSelectFolders: false,
				canSelectFiles: true,
				canSelectMany: false,
				openLabel: 'Select source package file...',
				defaultUri: workspacePath
			});
		}
		// console.log(workspacePath);
		const destFileref = await vscode.window.showOpenDialog({
			filters: {
				'Package files (*.xml)': ['XML']
			},
			canSelectFolders: false,
			canSelectFiles: true,
			canSelectMany: false,
			openLabel: 'Select destination package file...',
			defaultUri: workspacePath
		});

		// const destFile = await vscode.window.showInputBox({
		// 	placeHolder: "Source .xml file",
		// 	prompt: "Select destination file",
		// 	value: selectedText
		//   });
		destFile = destFileref[0].path.substring(0, 1) == '/' ? destFileref[0].path.substring(1) : destFileref[0].path;
		sourceFile = sourceFile[0].path.substring(0, 1) == '/' ? sourceFile[0].path.substring(1) : sourceFile[0].path;
		sourceFile = sourceFile.replace('c:/', 'C:/');
		console.log(sourceFile);
		console.log(destFile);
		if (sourceFile && destFile) {
			merger.mergePackageFiles(sourceFile, destFile);
			// Display a message box to the user
			vscode.window.showInformationMessage('Package File Updated!');
		} else {
			vscode.window.showErrorMessage('Please select a file.')
		}

	});
	let disposable2 = vscode.commands.registerCommand('salesforce-package-xml-power-tools.generatePackage', async function () {
		// console.log(vscode.workspace.workspaceFolders[0].uri.path.substring(1));
		// console.log(vscode.workspace.workspaceFolders);
		const options = {
			baseDir: vscode.workspace.workspaceFolders[0].uri._fsPath,
			binary: 'git',
			maxConcurrentProcesses: 6,
			trimmed: false,
		};

		// when setting all options in a single object
		const git = simpleGit(options);
		const commits = await git.log();
		const mainBranch = commits.all[commits.all.length - 1].refs;
		const changeLogRaw = (await git.diff([mainBranch, '--name-only']))
		const changeLog = changeLogRaw.split('\n').filter(element => element);;
		console.log(changeLog);
		
	});
	
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
