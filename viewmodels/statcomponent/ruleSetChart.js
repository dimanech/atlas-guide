'use strict';

const d3scale = require('d3-scale');
const d3shape = require('d3-shape');

function ruleSetChart(dataArr) {
    const width = 290;
    const height = 64;
    const max = Math.max(...dataArr);
    const scaleX = d3scale.scaleLinear()
        .domain([0, dataArr.length - 1])
        .range([0, width]);

    const scaleY = d3scale.scaleLinear()
        .domain([0, max < 5 ? 5 : max])
        .range([height, 0]);

    return d3shape.line()
        .x((d, i) => scaleX(i))
        .y(d => scaleY(d))
        .curve(d3shape.curveCatmullRom.alpha(0.5))(dataArr);
}

module.exports = ruleSetChart;
