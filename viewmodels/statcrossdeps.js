'use strict';

const path = require('path');

let pathToSCSS;
let excludedFilesRegexp;
const isPartial = fileName => /^_/i.test(fileName);
const isExcludedFile = file => excludedFilesRegexp.test(file);
const getReducedPath = str => str.replace(pathToSCSS, '').replace(/(^\/)|(\\)/, '').replace(/\.scss/, '');

function prepareImportsData(importsGraph, excludesRegexp) {
    pathToSCSS = new RegExp(path.resolve(importsGraph.dir).replace(/\\/g, '\\\\'));
    excludedFilesRegexp = excludesRegexp;

    let importsPaths = {
        'nodes': [],
        'links': []
    };

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
                importsPaths.nodes.push({
                    'id': getReducedPath(prop),
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

    return JSON.stringify(importsPaths);
}

module.exports = prepareImportsData;
