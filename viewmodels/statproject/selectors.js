'use strict';

function getAdditionalStat(selectors) {
    let stat = {
        universalSelectors: [],
        jsPrefixedSelectors: [],
        idSelectors: [],
        attributeSelectors: 0
    };

    selectors.values.forEach(selector => {
        if (/^\*|\*$/.test(selector)) {
            stat.universalSelectors.push(selector);
        }
        if (/\.js-/.test(selector)) {
            stat.jsPrefixedSelectors.push(selector);
        }
        if (/#/.test(selector)) {
            stat.idSelectors.push(selector);
        }
        if (/\[/.test(selector)) {
            stat.attributeSelectors++;
        }
    });

    return stat;
}

function selectors(selectors) {
    const additionalStat = getAdditionalStat(selectors);

    const selectorsStat = [{
        'name': 'Id',
        'count': selectors.id
    }, {
        'name': 'Class',
        'count': selectors['class']
    }, {
        'name': 'Pseudo class',
        'count': selectors.pseudoClass
    }, {
        'name': 'Pseudo element',
        'count': selectors.pseudoElement
    }, {
        'name': 'Type',
        'count': selectors.type
    }, {
        'name': 'Attribute',
        'count': additionalStat.attributeSelectors
    }, {
        'name': 'Universal',
        'count': additionalStat.universalSelectors.length
    }, {
        'name': 'js- prefixed',
        'count': additionalStat.jsPrefixedSelectors.length
    }];

    return {
        stat: selectorsStat.sort((a, b) => b.count - a.count),
        jsPrefixedSelectors: additionalStat.jsPrefixedSelectors,
        universalSelectors: additionalStat.universalSelectors,
        idSelectors: additionalStat.idSelectors
    };
}

module.exports = selectors;
