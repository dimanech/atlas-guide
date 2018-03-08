'use strict';

const d3scale = require('d3-scale');

function prepareComponentsFileSizesStat(sizeStats) {
    sizeStats.sort((a, b) => b.size - a.size);

    const max = sizeStats[0].size;
    const scale = d3scale.scaleLinear()
        .domain([0, max])
        .range([0, 400]);

    sizeStats.forEach(item => {
        const circleSize = scale(item.size);
        item.svg = {
            radius: circleSize / 2,
            size: circleSize
        };
    });

    return sizeStats;
}

module.exports = prepareComponentsFileSizesStat;
