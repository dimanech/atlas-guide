'use strict';

const path = require('path');
const format = require(path.join(__dirname, '../utils/format'));
const formatNumbers = format.numbers;

function renderLineChart(data) {
    const dataStr = JSON.stringify(data);

    return `
        <svg class="js-line-chart">
            <defs data-chart='${dataStr}'></defs>
        </svg>
        `;
}

function specificityChart(stats) {
    // simple array stats.selectors.getSpecificityGraph()
    return {
        'chart': renderLineChart(stats.selectors.getSpecificityValues()),
        'max': stats.selectors.specificity.max,
        'average': formatNumbers(stats.selectors.specificity.average)
    };
}

function ruleSizeChart(stats) {
    return {
        'chart': renderLineChart(stats.rules.selectorRuleSizes),
        'max': stats.rules.size.max,
        'average': formatNumbers(stats.rules.size.average)
    };
}

module.exports = {
    specificityChart: specificityChart,
    ruleSizeChart: ruleSizeChart
};
