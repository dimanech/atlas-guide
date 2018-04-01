'use strict';

function ruleSizeStat(array) {
    if (!array) {
        return false;
    }

    let selectorsList = array;
    let rulesetStat = {
        heavy: [],
        light: []
    };

    selectorsList.forEach(item => {
        if (parseFloat(item.declarations) > 15) {
            rulesetStat.heavy.push(item);
        }

        if (parseFloat(item.declarations) < 1) {
            rulesetStat.light.push(item);
        }
    });

    Object.keys(rulesetStat).forEach(key =>
        rulesetStat[key].sort((a, b) => parseFloat(b.declarations) - parseFloat(a.declarations)));

    return rulesetStat;
}

module.exports = ruleSizeStat;
