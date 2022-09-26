var convert = require('xml-js');
const fs = require('fs');

module.exports = {
    mergePackageFiles: function (sourcePath, destPath) {
        var source = convertFileToObject(sourcePath);
        var dest = convertFileToObject(destPath);
        console.log('source', source);
        console.log('dest', dest);
        if( source.Package.types.length == undefined){
            source.Package.types = [source.Package.types];
        }
        if( dest.Package.types.length == undefined){
            dest.Package.types = [dest.Package.types];
        }
        source.Package.types.forEach(sourceType => {
            var typeExists = false;
            for(var destType of dest.Package.types){
                if(destType.name._text === sourceType.name._text){
                    if(destType.members.length === undefined){
                        destType.members = [destType.members];
                    } 
                    if(sourceType.members.length === undefined) {
                        sourceType.members = [sourceType.members];
                    }
                    if(!(destType.members[0]._text == '*')){
                        destType.members.push(...sourceType.members);
                    }
                    typeExists = true;
    
                }
                if(destType.members.length === undefined){
                    destType.members = [destType.members];
                } 
                if(sourceType.members.length === undefined) {
                    sourceType.members = [sourceType.members];
                }
                destType.members.sort(function (a, b) {
                    if (a._text > b._text) {
                        return 1;
                    }
                    if (b._text > a._text) {
                        return -1;
                    }
                    return 0;
                });
                destType.members  = destType.members.filter(function(item, pos) {         
                    return pos === destType.members.length - 1 ? true : destType.members[pos + 1]._text !== item._text; 
                })
            }
            if(!typeExists){
                dest.Package.types.push(sourceType);
                // console.log(sourceType);
            }
        });
        dest.Package.types.sort(function (a, b) {
            if (a.name._text > b.name._text) {
                return 1;
            }
            if (b.name._text > a.name._text) {
                return -1;
            }
            return 0;
        });
        // console.log(dest);
        console.log('source', source);
        console.log('dest', dest);
        convertObjectToFile(dest, destPath);
    }
  };


function convertObjectToFile(object, file){
    const xml = convert.json2xml(object, {compact: true, spaces: 4});
    fs.writeFileSync(file, xml);
}

function convertFileToObject(file) {
    var xml = fs.readFileSync(file,'utf8')
    return convert.xml2js(xml, {compact: true, spaces: 4});
}


