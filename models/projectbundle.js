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
    const sep = path.sep;
    const pathToSCSS = new RegExp(path.join(importsGraph.dir, sep));
    let importsPaths = {};
    importsPaths[projectName] = {
        id: projectName,
        size: 0
    };

    for (let prop in importsGraph.index) {
        if (
            !importsGraph.index.hasOwnProperty(prop) ||
            excludedSassFiles.test(prop) ||
            !pathToSCSS.test(prop) // it is a bit tricky to handle sass additional imports path array
        ) {
            continue;
        }
        const pathStr = prop.toString();
        const fileName = path.basename(pathStr);
        const isPartial = /^_/i.test(fileName);
        if (isPartial) {
            const importedBy = importsGraph.index[prop].importedBy;
            const destList = pathStr.replace(pathToSCSS, '').replace(new RegExp(fileName), '').split(sep);

            importedBy.forEach(importedBy => {
                // push standalone resulted file
                const importFile = importedBy.toString().replace(pathToSCSS, ''); // could be import to partial file
                let cumulativePath = projectName + '/' + importFile;

                if (!importsPaths.hasOwnProperty(cumulativePath)) {
                    importsPaths[cumulativePath] = {
                        id: cumulativePath,
                        size: getResultedFileSize(importFile, pathToCSS)
                    };
                }

                // push missing folders
                for (let i = 0; i < destList.length - 1; i++) {
                    // check atlas/ not added here
                    cumulativePath = cumulativePath + '/' + destList[i];
                    if (!importsPaths.hasOwnProperty(cumulativePath)) {
                        importsPaths[cumulativePath] = {
                            id: cumulativePath,
                            size: 0
                        };
                    }
                }

                // push file
                const partial = cumulativePath + '/' + fileName;
                if (!importsPaths.hasOwnProperty(partial)) {
                    importsPaths[partial] = {
                        id: cumulativePath,
                        size: getfileSizeWithoutComments(prop)
                    };
                }
            });
        } else {
            const standaloneFile = projectName + '/' + pathStr.replace(pathToSCSS, '');
            if (!importsPaths.hasOwnProperty(standaloneFile)) {
                importsPaths[standaloneFile] = {
                    id: standaloneFile,
                    size: getResultedFileSize(standaloneFile, pathToCSS)
                };
            }
        }
    }

    const orderedPath = {};
    Object.keys(importsPaths).sort().forEach(key => orderedPath[key] = importsPaths[key]);

    return JSON.stringify(orderedPath);
}

module.exports = getImports;
