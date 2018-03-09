'use strict';

const d3scale = require('d3-scale');

module.exports = function(coverage) {
    const scale = d3scale.scaleLinear()
        .domain([0, coverage.all])
        .range([0, 500]);
    const coveredPercent = coverage.all / 100 * coverage.covered;

    return {
        'coveredPercent': coveredPercent,
        'all': coverage.all,
        'covered': coverage.covered,
        'graph': {
            'all': scale(coverage.all),
            'covered': scale(coverage.covered)
        }
    };
};
