'use strict';

const fs = require('fs');
const path = require('path');
// const _uniq = require('lodash.uniq');

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

function getImports(importsGraph, projectName, pathToCSS) {
    const pathToSCSS = new RegExp(path.join(importsGraph.dir, '/'));
    let importsPaths = [{
        id: projectName,
        size: 0
    }];

    for (let prop in importsGraph.index) {
        if (!importsGraph.index.hasOwnProperty(prop)) {
            continue;
        }
        const pathStr = prop.toString();
        const fileName = path.basename(pathStr);
        const isPartial = /^_/i.test(fileName);

        if (!isPartial) {
            continue;
        }
        const importedBy = importsGraph.index[prop].importedBy;
        const dest = pathStr.replace(pathToSCSS, '').replace(new RegExp(fileName), '').split('/');

        importedBy.forEach(importedBy => {
            // push standalone file (root)
            const importFile = importedBy.toString().replace(pathToSCSS, '');
            let cummulativePath = projectName + '/' + importFile;
            importsPaths.push({
                id: cummulativePath,
                size: getResultedFileSize(importFile, pathToCSS)
            });

            // push missing folders
            for (let i = 0; i < dest.length - 1; i++) {
                cummulativePath = cummulativePath + '/' + dest[i];
                importsPaths.push({
                    id: cummulativePath,
                    size: 0
                });
            }

            // push file
            importsPaths.push({
                id: cummulativePath + '/' + fileName,
                size: getfileSizeWithoutComments(prop)
            });
        });
    }

    // console.log( JSON.stringify(importsPaths, null, '\t'))

    // return JSON.stringify(_uniq(importsPaths.sort()));
}

module.exports = getImports;
