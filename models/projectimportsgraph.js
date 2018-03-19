'use strict';

const path = require('path');
const sassGraph = require('sass-graph');

function getImportsGraph(atlasBaseConfig) {
    const sassSrcPath = atlasBaseConfig.scssSrc;
    const sassSrcExternalImportsPath = atlasBaseConfig.scssAdditionalImportsArray;

    return sassGraph.parseDir(sassSrcPath, {loadPaths: sassSrcExternalImportsPath});
}

function getFileImports(relativeUrl, importsGraph) {
    const absUrl = path.resolve(relativeUrl);
    const fileInfo = importsGraph.index[absUrl];
    if (!fileInfo) {
        return {
            imports: [],
            importedBy: []
        };
    }

    function getFileNamesOnly(paths) {
        let normalizedPaths = [];

        if (paths) {
            paths.forEach(absPath => normalizedPaths.push(path.basename(absPath)));
        }

        return normalizedPaths;
    }

    return {
        imports: getFileNamesOnly(fileInfo.imports),
        importedBy: getFileNamesOnly(fileInfo.importedBy)
    };
}

module.exports = {
    'getImportsGraph': getImportsGraph,
    'getFileImports': getFileImports
};
