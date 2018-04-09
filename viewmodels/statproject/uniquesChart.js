'use strict';

const _uniq = require('lodash.uniq');
const _camelCase = require('lodash.camelcase');

function renderUniquesChart(obj, max) {
    return `
        <svg class="js-bar-chart">
            <defs data-chart='{"max": ${max},
            "data": [{"val": ${obj.total}, "name": "total"}, {"val": ${obj.unique}, "name": "unique"}]}'></defs>
        </svg>
        `;
}

function uniquesChart(stats) {
    let uniques = {
        max: 0,
        total: stats.declarations.total,
        unique: stats.declarations.unique
    };
    const keys = [
        'color', 'background-color', 'font-size', 'border-radius', 'z-index',
        'width', 'height', 'margin', 'padding', 'line-height'
    ];

    keys.forEach(key => {
        let camelKey = _camelCase(key);
        uniques[camelKey] = {
            name: key
        };
        if (!stats.declarations.properties[key]) {
            uniques[camelKey].total = 0;
            uniques[camelKey].unique = 0;
        } else {
            uniques[camelKey].total = stats.declarations.properties[key].length;
            uniques[camelKey].unique = stats.declarations.getUniquePropertyCount(key);

            if (uniques[camelKey].total > uniques.max) {
                uniques.max = uniques[camelKey].total;
            }
        }
    });

    const fontsStat = {
        'fontSize': stats.declarations.getAllFontSizes(),
        'fontFamily': stats.declarations.getAllFontFamilies()
    };

    Object.keys(fontsStat).forEach(key => {
        uniques[key] = {
            total: fontsStat[key].length,
            unique: _uniq(fontsStat[key]).length
        };
        if (uniques[key].total > uniques.max) {
            uniques.max = uniques[key].total;
        }
        uniques[key].chart = renderUniquesChart(uniques[key], uniques.max);
    });

    keys.forEach(key => {
        let camelKey = _camelCase(key);
        uniques[camelKey].chart = renderUniquesChart(uniques[camelKey], uniques.max);
    });

    return uniques;
}

module.exports = uniquesChart;
