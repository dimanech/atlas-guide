'use strict';

const path = require('path');

let projectName;
let pathToSCSS;
let resultedGraph;

function recreatePathTree(ctx, file) {
    const destinationList = file.split(path.sep);
    let cumulativePath = ctx;
    destinationList.forEach(function(item) {
        cumulativePath += '/' + item;
        if (resultedGraph.hasOwnProperty(cumulativePath)) {
            return;
        }
        resultedGraph[cumulativePath] = {
            id: cumulativePath
        };
    });
}

function visitAncestors(importsGraph, ctx, file) {
    const pathFromRoot = path.relative(pathToSCSS, file);
    const newCtx = ctx + '/' + pathFromRoot;

    recreatePathTree(ctx, pathFromRoot);
    importsGraph.index[file].imports.forEach(
        declaredImport => visitAncestors(importsGraph, newCtx, declaredImport));
}

function getImports(importsGraph, projectNamePassed, pathToCSSPassed, excludedSassFiles) {
    projectName = projectNamePassed;
    pathToSCSS = importsGraph.dir;
    resultedGraph = {};

    resultedGraph[projectName] = {
        id: projectName
    };

    for (let file in importsGraph.index) {
        if (!importsGraph.index.hasOwnProperty(file) || excludedSassFiles.test(file) ||
            /^\.\./.test(path.relative(pathToSCSS, file)) || /^_/.test(path.basename(file))) {
            continue;
        }
        const standaloneFile = path.relative(pathToSCSS, file).replace(new RegExp(path.sep), '-');
        const standaloneFileImports = importsGraph.index[file].imports;
        const initialCtx = projectName + '/' + standaloneFile;

        resultedGraph[initialCtx] = {
            id: initialCtx
        };
        standaloneFileImports.forEach(item => visitAncestors(importsGraph, initialCtx, item));
    }

    let orderedResultedGraph = {};
    Object.keys(resultedGraph).sort().forEach(function (key) {
        orderedResultedGraph[key] = resultedGraph[key];
    });
    return JSON.stringify(orderedResultedGraph);
}

module.exports = getImports;
