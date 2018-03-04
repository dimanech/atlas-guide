'use strict';

// const fs = require('fs');
const path = require('path');
// const d3fmt = require('d3-format');
// const d3scale = require('d3-scale');
//
// function prepareComponentsFileSizesStat(guideSrc) {
//     let sizeStats = [];
//
//     function getfileSize(path) {
//         const fileString = fs.readFileSync(path, 'utf8');
//         const stripedFile = fileString.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
//
//         return Buffer.byteLength(stripedFile, 'utf8');
//     }
//
//     function findComponents(url) {
//         const dir = fs.readdirSync(url);
//
//         for (let i = 0; i < dir.length; i++) {
//             const name = dir[i];
//             const target = path.join(url, name);
//             const stats = fs.statSync(target);
//
//             if (stats.isFile()) {
//                 if (path.extname(name) === '.scss') {
//                     const fileSize = getfileSize(target);
//                     sizeStats.push({
//                         filename: path.basename(name),
//                         size: fileSize,
//                         view: {
//                             size: d3fmt.format('.2s')(fileSize) + 'B'
//                         },
//                         svg: {
//                             radius: '',
//                             width: ''
//                         }
//                     });
//                 }
//             } else if (stats.isDirectory()) {
//                 findComponents(target);
//             }
//         }
//     }
//
//     findComponents(guideSrc);
//
//     sizeStats.sort((a, b) => b.size - a.size);
//
//     const max = sizeStats[0].size;
//     const scale = d3scale.scaleLinear()
//         .domain([0, max])
//         .range([0, 400]);
//
//     sizeStats.forEach((item) => {
//         const circleSize = scale(item.size);
//         item.svg = {
//             radius: circleSize / 2,
//             size: circleSize
//         };
//     });
//
//     return sizeStats;
// }

function getImports(importsGraph) {
    const projectName = 'test';
    const pathToSCSS = new RegExp(path.join(importsGraph.dir, '/'));
    let importsPaths = [projectName];

    for (let prop in importsGraph.index) {
        if (!importsGraph.index.hasOwnProperty(prop)) {
            continue;
        }
        const pathStr = prop.toString();
        const fileName = path.basename(pathStr);
        const isPartial = /^_/i.test(fileName);

        if (isPartial) {
            const importedBy = importsGraph.index[prop].importedBy;
            const dest = pathStr.replace(pathToSCSS, '').replace(new RegExp(fileName), '').split('/');
            // get partial size

            importedBy.forEach(importedBy => {
                // push standalone file (root)
                const importFile = importedBy.toString().replace(pathToSCSS, '');
                let cummulativePath = projectName + '/' + importFile;
                importsPaths.push(cummulativePath);

                // push missing folders
                for (let i = 0; i < dest.length - 1; i++) {
                    cummulativePath = cummulativePath + '/' + dest[i];
                    importsPaths.push(cummulativePath);
                }

                // push file
                importsPaths.push(cummulativePath + '/' + fileName);
            });
        }
    }

    // console.log( JSON.stringify(_uniq(importsPaths.sort())) )

    // return JSON.stringify(_uniq(importsPaths.sort()));
}

module.exports = getImports;
