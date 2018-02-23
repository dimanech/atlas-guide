'use strict';

const fs = require('fs');
const path = require('path');
const d3fmt = require('d3-format');
const d3scale = require('d3-scale');

function prepareComponentsFileSizesStat(guideSrc) {
    let sizeStats = [];

    function getfileSize(path) {
        const fileString = fs.readFileSync(path, 'utf8');
        const stripedFile = fileString.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

        return Buffer.byteLength(stripedFile, 'utf8');
    }

    function findComponents(url) {
        const dir = fs.readdirSync(url);

        for (let i = 0; i < dir.length; i++) {
            const name = dir[i];
            const target = path.join(url, name);
            const stats = fs.statSync(target);

            if (stats.isFile()) {
                if (path.extname(name) === '.scss') {
                    const fileSize = getfileSize(target);
                    sizeStats.push({
                        filename: path.basename(name),
                        size: fileSize,
                        view: {
                            size: d3fmt.format('.2s')(fileSize) + 'B'
                        },
                        svg: {
                            radius: '',
                            width: ''
                        }
                    });
                }
            } else if (stats.isDirectory()) {
                findComponents(target);
            }
        }
    }

    findComponents(guideSrc);

    sizeStats.sort((a, b) => b.size - a.size);

    const max = sizeStats[0].size;
    const scale = d3scale.scaleLinear()
        .domain([0, max])
        .range([0, 400]);

    sizeStats.forEach((item) => {
        const circleSize = scale(item.size);
        item.svg = {
            radius: circleSize / 2,
            size: circleSize
        };
    });

    return sizeStats;
}

module.exports = prepareComponentsFileSizesStat;
