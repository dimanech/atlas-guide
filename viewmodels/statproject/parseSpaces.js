'use strict';

const _uniq = require('lodash.uniq');

function parseSpaces(spacesArray) {
    if (!spacesArray) {
        return false;
    }

    let allMargins = [];

    spacesArray.forEach(declarationVal => {
        if (/calc/ig.test(declarationVal)) {
            return allMargins.push(declarationVal);
        }
        declarationVal.trim().split(/\s/).forEach(function(value) {
            allMargins.push(value);
        });
    });

    return _uniq(allMargins);
}

module.exports = parseSpaces;
