'use strict';

const path = require('path');

function bundleImports(importsGraph, excludedSassFiles) {
    let importsData = [];

    for (let prop in importsGraph.index) {
        if (!importsGraph.index.hasOwnProperty(prop) || excludedSassFiles.test(prop)) {
            continue;
        }
        const pathStr = prop.toString();
        const fileName = path.basename(pathStr);
        const isPartial = /^_/i.test(fileName);

        if (!isPartial) {
            const imports = importsGraph.index[prop].imports;
            const standaloneFile = {
                'name': fileName,
                'imports': []
            };

            imports.forEach(imports => standaloneFile.imports.push(path.basename(imports.toString())));
            importsData.push(standaloneFile);
        }
    }

    importsData.sort((a, b) => b.imports.length - a.imports.length);

    return importsData;
}

module.exports = bundleImports;
