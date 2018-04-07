'use strict';

const fs = require('fs');
const path = require('path');

let projectName;
let pathToCSS;
let pathToSCSS;

function getfileSize(string) {
    return Buffer.byteLength(string, 'utf8');
}

function getfileSizeWithoutComments(path) {
    const fileString = fs.readFileSync(path, 'utf8');
    const stripedFile = fileString.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

    return getfileSize(stripedFile);
}

function getResultedFileSize(name) {
    const filePath = path.join(pathToCSS, name.replace(/\.scss/, '.css'));
    let fileString = '';

    if (fs.existsSync(filePath)) {
        fileString = fs.readFileSync(filePath, 'utf8');
    }

    return getfileSize(fileString);
}

function getDestinationList(pathStr, fileName) {
    const sep = path.sep;
    return path.relative(pathToSCSS, pathStr)
        .replace(new RegExp(sep + fileName), '').split(sep);
}

function recreatePathTreeForPartial(importsPaths, importFile, fileName, partialFileSize, destinationList) {
    let cumulativePath = projectName + '/' + importFile;
    const pushNode = size => {
        if (!importsPaths.hasOwnProperty(cumulativePath)) {
            importsPaths[cumulativePath] = {
                id: cumulativePath,
                size: size
            };
        }
    };

    // push standalone resulted file
    pushNode(getResultedFileSize(importFile));

    // push all missing mediate folders
    destinationList.forEach(item => {
        cumulativePath = cumulativePath + '/' + item;
        pushNode(0);
    });

    // push partial file
    cumulativePath = cumulativePath + '/' + fileName;
    pushNode(partialFileSize);
}

function recreatePathTreeForStandalone(importsPaths, standaloneFile) {
    if (!importsPaths.hasOwnProperty(standaloneFile)) {
        importsPaths[standaloneFile] = {
            id: standaloneFile,
            size: getResultedFileSize(standaloneFile, pathToCSS)
        };
    }
}

function getImports(importsGraph, projectNamePassed, pathToCSSPassed, excludedSassFiles) {
    projectName = projectNamePassed;
    pathToCSS = pathToCSSPassed;
    pathToSCSS = importsGraph.dir;

    let importsPaths = {};
    importsPaths[projectName] = {
        id: projectName,
        size: 0
    };

    for (let file in importsGraph.index) {
        if (
            !importsGraph.index.hasOwnProperty(file) ||
            excludedSassFiles.test(file) ||
            // avoid to include additional imported sass component from graph
            // we use relative path to find if component path outside of project
            // we do this to avoid regexp with win paths
            // this could be buggy
            /^\.\./.test(path.relative(pathToSCSS, file))
        ) {
            continue;
        }
        const pathStr = file.toString();
        const fileName = path.basename(pathStr);
        const isPartial = /^_/i.test(fileName);

        if (isPartial) {
            const importedBy = importsGraph.index[file].importedBy;
            const destinationList = getDestinationList(pathStr, fileName);
            const partialFileSize = getfileSizeWithoutComments(file);

            importedBy.forEach(importedBy => {
                const importFile = path.relative(pathToSCSS, importedBy.toString()); // NB: could be import to partial
                recreatePathTreeForPartial(importsPaths, importFile, fileName, partialFileSize, destinationList);
            });
        } else {
            const standaloneFile = projectName + '/' + path.relative(pathToSCSS, pathStr);
            recreatePathTreeForStandalone(importsPaths, standaloneFile);
        }
    }

    const orderedPath = {};
    Object.keys(importsPaths).sort().forEach(function (key) {
        orderedPath[key] = importsPaths[key];
    });

    return JSON.stringify(orderedPath);
}

module.exports = getImports;
