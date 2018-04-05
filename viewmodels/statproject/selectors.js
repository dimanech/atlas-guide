'use strict';

function selectors(selectors) { // TODO: 25 lines
    let universalSelectors = [];
    let jsPrefixedSelectors = [];
    let idSelectors = [];
    let attributeSelectors = 0;

    selectors.values.forEach(selector => {
        if (/^\*|\*$/.test(selector)) {
            universalSelectors.push(selector);
        }
        if (/\.js-/.test(selector)) {
            jsPrefixedSelectors.push(selector);
        }
        if (/#/.test(selector)) {
            idSelectors.push(selector);
        }
        if (/\[/.test(selector)) {
            attributeSelectors++;
        }
    });

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
        'count': attributeSelectors
    }, {
        'name': 'Universal',
        'count': universalSelectors.length
    }, {
        'name': 'js- prefixed',
        'count': jsPrefixedSelectors.length
    }];

    return {
        stat: selectorsStat.sort((a, b) => b.count - a.count),
        jsPrefixedSelectors: jsPrefixedSelectors,
        universalSelectors: universalSelectors,
        idSelectors: idSelectors
    };
}

module.exports = selectors;
