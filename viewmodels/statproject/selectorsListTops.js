'use strict';

function selectorsListTops(array) {
    let selectorsList = array;
    let longestSelectors = [];

    selectorsList.forEach(list => {
        const selectorsArrayLength = list.split(/,/).length;
        if (parseFloat(selectorsArrayLength) > 3) {
            longestSelectors.push({
                selector: list.replace(/,/g, ',<br>'),
                selectors: selectorsArrayLength
            });
        }
    });

    longestSelectors.sort((a, b) => parseFloat(b.selectors) - parseFloat(a.selectors));

    return longestSelectors;
}

module.exports = selectorsListTops;
