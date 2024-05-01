import path from 'node:path';
import { getFileSizeWithoutComments, getResultedFileSize } from './utils/fileSize.mjs';

let projectName;
let pathToSCSS;
let pathToCSS;
let excludedSassFiles;
let resultedGraph;

const resultDelimiter = '/';

/**
 * Push each path item as separate node to the graph
 * @param {string} ctx - prefix for transformed path in format like 'root/standalone-file.css'
 * @param {string} relativePath - path to file relative to scss root
 * @param {string} fullPath - absolute path to the file
 */
function recreatePathTree(ctx, relativePath, fullPath) {
    const destinationList = relativePath.split(path.sep);
    let cumulativePath = ctx;
    destinationList.forEach(function(item) {
        cumulativePath += resultDelimiter + item;
        if (Object.hasOwnProperty.call(resultedGraph, cumulativePath)) {
            return;
        }
        resultedGraph[cumulativePath] = {
            id: cumulativePath,
            size: item.match(/\.scss$/) ? getFileSizeWithoutComments(fullPath) : 0
        };
    });
}

/**
 * Recursive visit all files and their imports up to the tree and process each import
 * @param {object} importsGraph
 * @param {string} ctx - prefix for transformed path in format like 'root/standalone-file.css'
 * @param {string} file - absolute path to the file
 */
function visitAncestors(importsGraph, ctx, file) {
    if (excludedSassFiles.test(file)) {
        return;
    }
    const pathFromRoot = path.relative(pathToSCSS, file);
    const newCtx = ctx + resultDelimiter + pathFromRoot.replace(/[\\|/]/g, resultDelimiter);

    recreatePathTree(ctx, pathFromRoot, file);
    importsGraph.index[file].imports.forEach(
        declaredImport => visitAncestors(importsGraph, newCtx, declaredImport));
}

/**
 * Initialize transformed graph object and visit all standalone scss files imports up to the tree
 * @param importsGraph
 */
function prepareImportsGraph(importsGraph) {
    resultedGraph = {};
    resultedGraph[projectName] = {
        id: projectName,
        size: 0
    };

    for (let file in importsGraph.index) {
        if (!Object.hasOwnProperty.call(importsGraph.index, file) ||
            excludedSassFiles.test(file) ||
            /^_/.test(path.basename(file))
        ) {
            continue;
        }
        const standaloneFile = path.relative(pathToSCSS, file)
        // replace path separator for deep nested standalone files
        // "some/other/standalone.scss" become "some-other-standalone.scss"
            .replace(/[\\|\/]/g, '-');
        const standaloneFileImports = importsGraph.index[file].imports;
        const initialCtx = projectName + resultDelimiter + standaloneFile;

        resultedGraph[initialCtx] = {
            id: initialCtx,
            size: getResultedFileSize(path.basename(file), pathToCSS)
        };
        standaloneFileImports.forEach(item => visitAncestors(importsGraph, initialCtx, item));
    }
}

function sortGraph(resultedGraph) {
    let orderedResultedGraph = {};
    Object.keys(resultedGraph).sort().forEach((key) => {
        orderedResultedGraph[key] = resultedGraph[key];
    });
    return orderedResultedGraph;
}

const getImports = (importsGraph, projectNamePassed, pathToCSSPassed, excludedSassFilesPassed) => {
    projectName = projectNamePassed;
    pathToSCSS = importsGraph.dir;
    pathToCSS = pathToCSSPassed;
    excludedSassFiles = excludedSassFilesPassed;

    prepareImportsGraph(importsGraph);

    return JSON.stringify(sortGraph(resultedGraph));
};

export default getImports;
