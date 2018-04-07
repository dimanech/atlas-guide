'use strict';

function getMetricStat(item, decl) {
    const regexp = new RegExp('^' + item); // we need to cover several cases - margin, margin-top, margin-start, etc.
    let stat = [];
    if (regexp.test(decl.prop)) {
        const metricList = decl.value.split(' ');
        metricList.forEach(value => stat.push(value));
    }

    return stat;
}

module.exports = getMetricStat;
