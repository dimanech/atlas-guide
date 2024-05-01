import path from 'node:path';
import sassGraph from 'sass-graph';

const getImportsGraph = (atlasBaseConfig) => {
    const sassSrcPath = atlasBaseConfig.scssSrc;
    const sassSrcExternalImportsPath = atlasBaseConfig.scssAdditionalImportsArray;

    return sassGraph.parseDir(sassSrcPath, { loadPaths: sassSrcExternalImportsPath });
};

const getFileImports = (relativeUrl, importsGraph) => {
    const absUrl = path.resolve(relativeUrl);
    const fileInfo = importsGraph.index[absUrl];

    if (!fileInfo) {
        return {
            imports: [],
            importedBy: []
        };
    }

    const getFileNamesOnly = (pathsList) => {
        let normalizedPaths = [];

        if (pathsList.length) {
            pathsList.forEach(absPath => normalizedPaths.push(path.basename(absPath)));
        }

        return normalizedPaths;
    };

    return {
        imports: getFileNamesOnly(fileInfo.imports),
        importedBy: getFileNamesOnly(fileInfo.importedBy)
    };
};

export { getImportsGraph, getFileImports };
