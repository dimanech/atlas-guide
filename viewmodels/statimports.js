'use strict';

const path = require('path');

function prepareImportsData(importsGraph, excludesRegexp) {
    const pathToSCSS = new RegExp(path.resolve(importsGraph.dir) + '/');

    function isExcludedFile(file) {
        return excludesRegexp.test(file);
    }

    function getReducedPath(str) {
        return str.replace(pathToSCSS, '')
            .replace(/\.scss/, '');
    }

    let importsPaths = {
        'nodes': [],
        'links': []
    };

    for (let prop in importsGraph.index) {
        if (!importsGraph.index.hasOwnProperty(prop)) {
            continue;
        }
        const pathStr = prop.toString();
        const fileName = path.basename(pathStr, '.scss');

        if (isExcludedFile(fileName)) {
            continue;
        }
        const isPartial = fileName => /^_/i.test(fileName);

        if (!isPartial(path.basename(pathStr, '.scss'))) {
            importsPaths.nodes.push({
                'id': getReducedPath(prop),
                'depth': 1,
                'mass': importsGraph.index[prop].imports.length
            });
        } else {
            const importedBy = importsGraph.index[prop].importedBy;
            let weight = 0;

            for (let i = 0; i < importedBy.length; i++) {
                if (!isPartial(path.basename(importedBy[i], '.scss'))) { // eslint-disable-line max-depth
                    weight = weight + 1;
                }
            }

            if (weight > 1) {
                importsPaths.nodes.push({
                    'id': getReducedPath(prop),
                    'depth': 2,
                    'mass': 1
                });

                for (let i = 0; i < importedBy.length; i++) { // eslint-disable-line max-depth
                    importsPaths.links.push({
                        source: getReducedPath(prop),
                        target: getReducedPath(importedBy[i])
                    });
                }
            } else if (importedBy.length === 0) {
                importsPaths.nodes.push({
                    'id': getReducedPath(prop),
                    'depth': 0,
                    'mass': 0
                });
            }
        }
    }

    // const fs = require('fs');
    // fs.writeFileSync('./imports.json', JSON.stringify(importsPaths, null, '\t'));

    return JSON.stringify(importsPaths);
}

module.exports = prepareImportsData;
