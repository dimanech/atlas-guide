'use strict';

const path = require('path');
const format = require(path.join(__dirname, '../utils/format'));
const formatNumbers = format.numbers;

function totals(stats) {
    if (!stats) {
        return false;
    }

    return {
        rules: formatNumbers(stats.rules.total),
        selectors: formatNumbers(stats.selectors.total),
        declarations: formatNumbers(stats.declarations.total),
        properties: formatNumbers(Object.keys(stats.declarations.properties).length)
    };
}

module.exports = totals;
