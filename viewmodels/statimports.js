'use strict';

const path = require('path');

function bundleImports(importsGraph, excludedSassFiles) {
    let importsData = [];
    const filesList = importsGraph.index;

    Object.keys(filesList).forEach(item => {
        if (excludedSassFiles.test(item)) {
            return;
        }
        const fileName = path.basename(item.toString());
        const isPartial = /^_/i.test(fileName);

        if (!isPartial) {
            const imports = filesList[item].imports;
            const standaloneFile = {
                'name': fileName,
                'imports': []
            };

            imports.forEach(imports => standaloneFile.imports.push(path.basename(imports.toString())));
            importsData.push(standaloneFile);
        }
    });

    importsData.sort((a, b) => b.imports.length - a.imports.length);

    return importsData;
}

module.exports = bundleImports;
