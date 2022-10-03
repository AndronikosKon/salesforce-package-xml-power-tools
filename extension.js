// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const fs = require('fs');
const vscode = require('vscode');
const merger = require('./src/merger');
const generator = require('./src/generator');
const simpleGit = require('simple-git');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let savedSourcePackage;
	let savedDestPackage;
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	const config = vscode.workspace.getConfiguration('PackageXmlPowerTools');
	const apiVersion = config.get('MetadataApiVersion');
	const defaultMergeLocation = config.get('packageMerge.defaultPackageLocation');
	const defaultGenerateLocation = config.get('packageGenerate.defaultPackageLocation');
	const defaultGenerateFileName = config.get('packageGenerate.defaultPackageName');
	const indentationNumber = config.get('indentationNumber');
	const indentationChatacter = config.get('indentationType');
	let indentation = indentationChatacter.repeat(indentationNumber);
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json

	let generateDefault = vscode.commands.registerCommand('salesforce-package-xml-power-tools.generatePackageDefault', async function () {
		const workspacePath = vscode.workspace.workspaceFolders[0].uri;
		let filePath = (workspacePath._fsPath + defaultGenerateLocation).replace(/\\/g, "/");
		filePath += defaultGenerateFileName;
		await generatePackage(filePath, indentation, apiVersion);
	});

	let generateDefaultLocation = vscode.commands.registerCommand('salesforce-package-xml-power-tools.generatePackageDefaultLocation', async function () {
		const workspacePath = vscode.workspace.workspaceFolders[0].uri;
		let filePath = (workspacePath._fsPath + defaultGenerateLocation).replace(/\\/g, "/");
		const fileName = await vscode.window.showInputBox({
			prompt: "Destination package name:",
			value: '.xml',
			valueSelection: [0,0]
		  });

		if(fileName == '.xml'){
			vscode.window.showErrorMessage('Please enter a package Name.');
			return;
		}

		if(!fileName.includes('.xml')){
			vscode.window.showErrorMessage('Please enter a valid package Name with file extention ".xml".');
			return;
		}
		filePath += fileName;
		await generatePackage(filePath, indentation, apiVersion);
	});

	let generate = vscode.commands.registerCommand('salesforce-package-xml-power-tools.generatePackage', async function () {
		const workspacePath = vscode.workspace.workspaceFolders[0].uri;
		let filePath = (workspacePath._fsPath).replace(/\\/g, "/");

		filePath = await vscode.window.showInputBox({
			prompt: "Destination folder:",
			value: filePath,
			valueSelection: [filePath.length,filePath.length]
		});

		if(filePath == null){
			vscode.window.showErrorMessage('Please enter a destination folder.');
			return;
		}

		if(!filePath.includes('.xml')){

			if(!fs.existsSync(filePath)) {
				vscode.window.showErrorMessage('Please enter an existing destination folder.');
				return;
			}

			if(filePath.substr(filePath.length - 1) != '/'){
				filePath += '/';
			}

			let fileName = await vscode.window.showInputBox({
				prompt: "Destination package name:",
				value: '.xml',
				valueSelection: [0,0]
			});
	
			if(fileName == '.xml' || fileName == undefined){
				vscode.window.showErrorMessage('Please enter a package Name.');
				return;
			}
	
			if(!fileName.includes('.xml')){
				vscode.window.showErrorMessage('Please enter a valid package Name with file extention ".xml".');
				return;
			}
	
			filePath += fileName;
		}

		
		await generatePackage(filePath, indentation, apiVersion);
	});

	let generateHere = vscode.commands.registerCommand('salesforce-package-xml-power-tools.generatePackageHere', async function (uri) {
		let filePath = (uri._fsPath).replace(/\\/g, "/");
		console.log(filePath);
		await generatePackage(filePath, indentation, apiVersion);
	});

	let merge = vscode.commands.registerCommand('salesforce-package-xml-power-tools.mergePackages', async function (uri) {
		// The code you place here will be executed every time your command is executed
		// console.log(uri);
		const workspacePath = vscode.workspace.workspaceFolders[0].uri;
		workspacePath._formatted = workspacePath._formatted + defaultMergeLocation;
		workspacePath._fsPath = workspacePath._fsPath + defaultMergeLocation.replace('/','\\');
		workspacePath.path = workspacePath.path + defaultMergeLocation.replace('/','//');
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
		if(sourceFile == undefined && destFileref == undefined){
			vscode.window.showErrorMessage('Please select a source and a destination file.');
			return;
		}
		if(sourceFile == undefined){
			vscode.window.showErrorMessage('Please select a source file.');
			return;
		}
		if(destFileref == undefined){
			vscode.window.showErrorMessage('Please select a destination file.');
			return;
		}
		
		destFile = destFileref[0].path.substring(0, 1) == '/' ? destFileref[0].path.substring(1) : destFileref[0].path;
		sourceFile = sourceFile[0].path.substring(0, 1) == '/' ? sourceFile[0].path.substring(1) : sourceFile[0].path;
		sourceFile = sourceFile.replace('c:/', 'C:/');
		// console.log(sourceFile);
		// console.log(destFile);
		if (sourceFile && destFile) {
			merger.mergePackageFiles(sourceFile, destFile, indentation);
			// Display a message box to the user
			vscode.window.showInformationMessage('Package File Updated!');
		} else {
			vscode.window.showErrorMessage('Please select a file.')
		}

	});

	let addSourceFile = vscode.commands.registerCommand('salesforce-package-xml-power-tools.addSourceFile', async function (uri) {
		savedSourcePackage = (uri._fsPath).replace(/\\/g, "/");
	});

	let addDestFile = vscode.commands.registerCommand('salesforce-package-xml-power-tools.addDestFile', async function (uri) {
		savedDestPackage = (uri._fsPath).replace(/\\/g, "/");
	});

	let mergeSavedFiles = vscode.commands.registerCommand('salesforce-package-xml-power-tools.mergeSavedFiles', async function () {
		if(savedDestPackage == undefined && savedSourcePackage == undefined){
			vscode.window.showErrorMessage('Please select a source and a destination folder before running this command.');
			return;
		}

		if(savedSourcePackage == undefined){
			vscode.window.showErrorMessage('Please select a source folder before running this command.');
			return;
		}

		if(savedDestPackage == undefined){
			vscode.window.showErrorMessage('Please select a destination folder before running this command.');
			return;
		}
		merger.mergePackageFiles(savedSourcePackage, savedDestPackage, indentation);
		// Display a message box to the user
		vscode.window.showInformationMessage('Package File Updated!');

	});

	let mergeSavedSourceHere = vscode.commands.registerCommand('salesforce-package-xml-power-tools.mergeSavedSourceHere', async function (uri) {
		savedDestPackage = (uri._fsPath).replace(/\\/g, "/");
		
		if(savedDestPackage == undefined && savedSourcePackage == undefined){
			vscode.window.showErrorMessage('Please select a source and a destination folder before running this command.');
			return;
		}

		if(savedSourcePackage == undefined){
			vscode.window.showErrorMessage('Please select a source folder before running this command.');
			return;
		}

		if(savedDestPackage == undefined){
			vscode.window.showErrorMessage('Please select a destination folder before running this command.');
			return;
		}
		merger.mergePackageFiles(savedSourcePackage, savedDestPackage, indentation);
		// Display a message box to the user
		vscode.window.showInformationMessage('Package File Updated!');

	});
	
	context.subscriptions.push(merge, generateDefault, generateDefaultLocation, generate, addSourceFile, addDestFile, mergeSavedFiles, generateHere, mergeSavedSourceHere);
}



// this method is called when your extension is deactivated
function deactivate() { 
}

module.exports = {
	activate,
	deactivate
}

async function generatePackage(filePath, indentation, apiVersion) {
	
		const baseDir = vscode.workspace.workspaceFolders[0].uri._fsPath.replace(/\\/g, "/");
		// console.log(baseDir);
		const options = {
			baseDir: baseDir,
			binary: 'git',
			maxConcurrentProcesses: 6,
			trimmed: false,
		};
		// when setting all options in a single object
		const git = simpleGit(options);
		const commits = await git.log();
		var currentBranch = commits.latest.refs.replace('HEAD -> ', '');
		var mainBranch;
		console.log(commits);
		let shouldSkip = false;
		commits.all.forEach(commit => {
			if (shouldSkip) return;

			if(commit.refs && !commit.refs.includes(currentBranch)){
				mainBranch = commit.refs.split(',')[0].replace('origin/','');
				shouldSkip = true;
			}
		});
		const changeLogRaw = (await git.diff([mainBranch, '--name-only']));
		const changeLog = changeLogRaw.split('\n').filter(element => element);
		generator.generatePackage(changeLog, filePath, indentation, apiVersion);
}
