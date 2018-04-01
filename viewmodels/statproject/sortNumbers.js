'use strict';

function sortNumbers(zIndices) {
    const sorted = zIndices;

    if (!sorted) {
        return false;
    }

    return sorted.sort((a, b) => a - b);
}


module.exports = sortNumbers;
