const ruleSizeStat = (selectorsList) => {
    if (!selectorsList) {
        return false;
    }

    let rulesetStat = {
        heavy: [],
        empty: []
    };

    selectorsList.forEach(item => {
        if (item.declarations > 15) {
            rulesetStat.heavy.push(item);
        }

        if (item.declarations < 1) {
            rulesetStat.empty.push(item);
        }
    });

    Object.keys(rulesetStat).forEach(key => rulesetStat[key].sort(
        (a, b) => b.declarations - a.declarations));

    return rulesetStat;
}

export default ruleSizeStat;
