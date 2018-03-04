'use strict';

const fs = require('fs');
const path = require('path');

function getfileSize(string) {
    return Buffer.byteLength(string, 'utf8');
}

function getfileSizeWithoutComments(path) {
    const fileString = fs.readFileSync(path, 'utf8');
    const stripedFile = fileString.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

    return getfileSize(stripedFile);
}

function getResultedFileSize(name, pathToCSS) {
    const filePath = path.join(pathToCSS, name.replace(/\.scss/, '.css'));
    let fileString = '';

    if (fs.existsSync(filePath)) {
        fileString = fs.readFileSync(filePath, 'utf8');
    }

    return getfileSize(fileString);
}

function getImports(importsGraph, projectName, pathToCSS, excludedSassFiles) {
    const pathToSCSS = new RegExp(path.join(importsGraph.dir, '/'));
    let importsPaths = {};
    importsPaths[projectName] = {
        id: projectName,
        size: 0
    };

    for (let prop in importsGraph.index) {
        if (!importsGraph.index.hasOwnProperty(prop) || excludedSassFiles.test(prop)) {
            continue;
        }
        const pathStr = prop.toString();
        const fileName = path.basename(pathStr);
        const isPartial = /^_/i.test(fileName);
        if (isPartial) {
            const importedBy = importsGraph.index[prop].importedBy;
            const dest = pathStr.replace(pathToSCSS, '').replace(new RegExp(fileName), '').split('/');

            importedBy.forEach(importedBy => {
                // push resulted file
                const importFile = importedBy.toString().replace(pathToSCSS, ''); // could be import to partial file
                let cummulativePath = projectName + '/' + importFile;

                if (!importsPaths.hasOwnProperty(cummulativePath)) {
                    importsPaths[cummulativePath] = {
                        id: cummulativePath,
                        size: getResultedFileSize(importFile, pathToCSS)
                    };
                }

                // push missing folders
                for (let i = 0; i < dest.length - 1; i++) {
                    cummulativePath = cummulativePath + '/' + dest[i];
                    if (!importsPaths.hasOwnProperty(cummulativePath)) {
                        importsPaths[cummulativePath] = {
                            id: cummulativePath,
                            size: 0
                        };
                    }
                }

                // push file
                const partial = cummulativePath + '/' + fileName;
                if (!importsPaths.hasOwnProperty(partial)) {
                    importsPaths[partial] = {
                        id: cummulativePath,
                        size: getfileSizeWithoutComments(prop)
                    };
                }
            });
        } else {
            const id = projectName + '/' + pathStr.replace(pathToSCSS, '');
            if (!importsPaths.hasOwnProperty(id)) {
                importsPaths[id] = {
                    id: id,
                    size: getResultedFileSize(id, pathToCSS)
                };
            }
        }
    }

    const orderedPath = {};
    Object.keys(importsPaths).sort().forEach(key => orderedPath[key] = importsPaths[key]);

    // fs.writeFileSync('importsResults.json', JSON.stringify(orderedPath, null, '\t'))

    return JSON.stringify(orderedPath);
}

module.exports = getImports;
