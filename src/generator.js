const fs = require('fs');
const { type } = require('os');
var convert = require('xml-js');
var registry = require('./registry.json');

module.exports = {
    generatePackage: function (changes, filePath, indentation, apiVersion) {
        let processedChanges = [];
        changes.forEach(function (change) {
            if(! change.includes('force-app/main/default/')) return;
            let changePath = change.replace('force-app/main/default/','').split('/');
            let changeName = changePath.pop().replace('-meta.xml','');
            // console.log(changePath);
            const directoryType = registry.strictDirectoryNames[changePath.shift()];
            if (directoryType){
                // if the change is a bundle, use the containing folder as a name.
                if(registry.types[directoryType].strategies.adapter === 'bundle'){
                    processedChanges.push({objectName: changePath.shift(), objectType: directoryType});
                    return;
                }
                // console.log(changePath);
                if(registry.types[directoryType].children && changePath.length > 1){
                    var parent = changePath.shift();
                    var type = registry.types[directoryType].children.directories[changePath.shift()];
                    processedChanges.push({objectName: parent + '.' + changeName.split('.')[0], objectType: type});
                    return;

                }
                processedChanges.push({objectName: changeName.split('.')[0], objectType: directoryType})
                // console.log({directoryType});
                return;
            }
            const suffixMatch = registry.suffixes[changeName.split('.').pop()];
            if(suffixMatch){
                processedChanges.push({objectName: changeName.split('.')[0], objectType: suffixMatch});
                // console.log({suffixMatch});
                return;
            }
            
        });
        processedChanges = processedChanges.filter(function(item, pos) {         
            return pos === processedChanges.length - 1 ? true : processedChanges[pos + 1].objectName !== item.objectName; 
        })
        // console.log(processedChanges);

        var xmlObj = getDefaultXML(apiVersion);
        processedChanges.forEach(change => {
            if(xmlObj.Package.types.filter(type => { return type.name._text === change.objectType}).length === 0){
                xmlObj.Package.types.push({members: [], name: {_text: change.objectType}});
            }

            xmlObj.Package.types.forEach(type => {
                if(type.name._text === change.objectType){
                    type.members.push({_text: change.objectName});
                }
            });
            // [change.objectType].members.push({_text: change.objectName});
        });
        // console.log(xmlObj);
        convertObjectToFile(xmlObj, filePath, indentation);

    }
}

function getDefaultXML(apiVersion) {
    var xmlObj = {};
    xmlObj._declaration = {_attributes: {version: "1.0", encoding: "UTF-8", standalone: "yes"}};
    xmlObj.Package = {_attributes:{xmlns: "http://soap.sforce.com/2006/04/metadata"}, types: [], version: {_text: apiVersion}};
    return xmlObj
}

function convertObjectToFile(object, file, indentation){
    const xml = convert.js2xml(object, {compact: true, spaces: indentation});
    // console.log(xml);
    fs.writeFileSync(file, xml);
}
