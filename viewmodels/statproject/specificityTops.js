'use strict';

function specificityTops(array) {
    let selectorsList = array;
    let heavySelectors = [];

    selectorsList.forEach(item => {
        if (parseFloat(item.specificity) > 32) {
            heavySelectors.push(item);
        }
    });

    heavySelectors.sort((a, b) => parseFloat(b.specificity) - parseFloat(a.specificity));

    return heavySelectors;
}

module.exports = specificityTops;
