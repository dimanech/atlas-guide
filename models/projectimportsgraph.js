'use strict';

const path = require('path');
const sassGraph = require('sass-graph');

function getImportsGraph(atlasConfig) {
    const config = atlasConfig.getBase();

    const sassSrcPath = config.scssSrc;
    const sassSrcExternalImportsPath = config.scssAdditionalImportsArray;

    // const fs = require('fs');
    // fs.writeFileSync('./imports2.json',
    // JSON.stringify(sassGraph.parseDir(sassSrcPath, {loadPaths: sassSrcExternalImportsPath}), null, '\t'));

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
