const vscode = require('vscode');
const convert = require('xml-js');
const fs = require('fs');
const simpleGit = require('simple-git');



const options= {
    baseDir: vscode.workspace.workspaceFolders[0].uri,
    binary: 'git',
    maxConcurrentProcesses: 6,
    trimmed: false,
 };
 
 // when setting all options in a single object
 const git = simpleGit(options);

console.log(process.cwd());
console.log(git.branchLocal());
