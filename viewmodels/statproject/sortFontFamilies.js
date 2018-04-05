'use strict';

const _uniq = require('lodash.uniq');

function sortFontFamilies(values) {
    let normalizedNames = [];
    values.forEach(item => {
        normalizedNames.push(item.replace(/, /g, ','));
    });
    return _uniq(normalizedNames);
}

module.exports = sortFontFamilies;
