'use strict';

const path = require('path');

let pathToSCSS;
let excludedFilesRegexp;
const isPartial = fileName => /^_/i.test(fileName);
const isExcludedFile = fileName => excludedFilesRegexp.test(fileName);
const getReducedPath = str => str.replace(pathToSCSS, '').replace(/(^\/)|(\\)/, '').replace(/\.scss/, '');

function prepareDuplicatesModel(name, data) {
    const importedBy = data.importedBy;
    const reducedPath = getReducedPath(name);

    return {
        name: reducedPath,
        displayName: path.basename(reducedPath),
        total: importedBy.length,
        importedBy: Array.from(importedBy, item => getReducedPath(item))
    };
}

function prepareImportsData(importsGraph, excludesRegexp) {
    pathToSCSS = new RegExp(path.resolve(importsGraph.dir).replace(/\\/g, '\\\\'));
    excludedFilesRegexp = excludesRegexp;

    let importsPaths = {
        'nodes': [],
        'links': []
    };
    let orphans = [];
    let duplicates = [];

    Object.keys(importsGraph.index).forEach(prop => {
        const fileName = path.basename(prop.toString(), '.scss');

        if (isExcludedFile(fileName)) {
            return;
        }

        if (isPartial(fileName)) {
            const importedBy = importsGraph.index[prop].importedBy;
            let weight = 0;

            importedBy.forEach(source => {
                if (!isPartial(path.basename(source, '.scss'))) {
                    weight = weight + 1;
                }
            });

            if (weight > 1) {
                duplicates.push(prepareDuplicatesModel(prop, importsGraph.index[prop]));

                importsPaths.nodes.push({
                    'id': getReducedPath(prop),
                    'depth': 2,
                    'mass': 1
                });
                importedBy.forEach(source => {
                    importsPaths.links.push({
                        source: getReducedPath(prop),
                        target: getReducedPath(source)
                    });
                });
            } else if (importedBy.length === 0) {
                const name = getReducedPath(prop);
                orphans.push({
                    name: name,
                    displayName: path.basename(name)
                });
                importsPaths.nodes.push({
                    'id': name,
                    'depth': 0,
                    'mass': 0
                });
            }
        } else {
            importsPaths.nodes.push({
                'id': getReducedPath(prop),
                'depth': 1,
                'mass': importsGraph.index[prop].imports.length
            });
        }
    });

    duplicates.sort((a, b) => b.importedBy.length - a.importedBy.length);

    return {
        graphData: JSON.stringify(importsPaths),
        orphans: orphans,
        duplicates: duplicates
    };
}

module.exports = prepareImportsData;
