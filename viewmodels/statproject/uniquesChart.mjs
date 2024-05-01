import _uniq from 'lodash.uniq';
import _camelCase from 'lodash.camelcase';

function renderUniquesChart(obj, max) {
    return `
        <svg class="js-bar-chart">
            <defs data-chart='{"max": ${max},
            "data": [{"val": ${obj.total}, "name": "total"}, {"val": ${obj.unique}, "name": "unique"}]}'></defs>
        </svg>
        `;
}

function calcReusability(total, unique) {
    if (total === 0 && unique === 0) {
        return 0;
    }
    const countOfRepeats = total - unique;
    return Math.floor(countOfRepeats * 100 / total);
}

function uniquesChart(stats) {
    let uniques = {
        max: 0,
        total: stats.declarations.total,
        unique: stats.declarations.unique,
        reusability: calcReusability(stats.declarations.total, stats.declarations.unique)
    };

    // Get stat for keys
    const keys = [
        'color', 'background-color', 'border-radius', 'z-index',
        'width', 'height', 'margin', 'padding', 'line-height'
    ];
    keys.forEach(key => {
        let keyName = _camelCase(key);
        let total = 0;
        let unique = 0;

        if (stats.declarations.properties[key]) {
            total = stats.declarations.properties[key].length;
            unique = stats.declarations.getUniquePropertyCount(key);

            if (total > uniques.max) {
                uniques.max = total;
            }
        }

        uniques[keyName] = {
            name: key,
            total: total,
            unique: unique,
            reusability: calcReusability(total, unique)
        };
    });

    // fontSize and fontFamily has different place in model
    const fontsStat = {
        'fontSize': stats.declarations.getAllFontSizes(),
        'fontFamily': stats.declarations.getAllFontFamilies()
    };
    Object.keys(fontsStat).forEach(key => {
        const total = fontsStat[key].length;
        const unique = _uniq(fontsStat[key]).length;

        if (total > uniques.max) {
            uniques.max = total;
        }

        uniques[key] = {
            name: key,
            total: total,
            unique: unique,
            reusability: calcReusability(total, unique)
        };
    });

    // depends on uniques.max of all tested properties
    keys.push('fontSize', 'fontFamily');
    keys.forEach(key => {
        let camelKey = _camelCase(key);
        uniques[camelKey].chart = renderUniquesChart(uniques[camelKey], uniques.max);
    });

    return uniques;
}

export default uniquesChart;
