'use strict';

const _uniq = require('lodash.uniq');
const _camelCase = require('lodash.camelcase');
const _size = require('lodash.size');
const d3fmt = require('d3-format');
const color = require('d3-color');

function humanize(number) {
    if (!number) {
        return 0;
    }
    const length = number.toString().length;

    if (length > 4) {
        return d3fmt.format('.2s')(number);
    } else {
        return d3fmt.format(',')(number);
    }
}

function convertFontToAbsoluteUnits(value) {
    let raw = parseFloat(value);

    if (typeof value !== 'string') {
        value = value.toString();
    }

    if (value.match(/px$/)) {
        return raw;
    }
    if (value.match(/em$/)) {
        return raw * 16;
    }
    if (value.match(/%$/)) {
        return raw * 0.16;
    }

    switch (value) {
        case 'inherit':
            return 16;
        case 'xx-small':
            return 9;
        case 'x-small':
            return 10;
        case 'small':
            return 13;
        case 'medium':
            return 16;
        case 'large':
            return 18;
        case 'x-large':
            return 24;
        case 'xx-large':
            return 32;
        case 'larger':
            return 19;
        default:
            return 0;
    }
}

function renderLineChart(data) {
    const dataStr = JSON.stringify(data);

    return `
        <svg class="js-line-chart">
            <defs data-chart='${dataStr}'></defs>
        </svg>
        `;
}

function renderUniquesChart(obj, max) {
    return `
        <svg class="js-bar-chart">
            <defs data-chart='{"max": ${max},
            "data": [{"val": ${obj.total}, "name": "total"}, {"val": ${obj.unique}, "name": "unique"}]}'></defs>
        </svg>
        `;
}

function fileSizesChart(data) {
    const dataStr = JSON.stringify(data);

    return `
        <svg class="js-stacked-chart">
            <defs data-chart='${dataStr}'></defs>
        </svg>
        `;
}

function sortFontFamilies(values) {
    let normalizedNames = [];
    values.forEach(item => {
        normalizedNames.push(item.replace(/, /g, ','));
    });
    return _uniq(normalizedNames);
}

function sortSizes(size) {
    if (!size) {
        return false;
    }
    const sortBy = function (a, b) {
        const c = a.abs;
        const d = b.abs;
        if (c > d) {
            return -1;
        } else {
            return 1;
        }
    };
    let sorted = [];

    size.forEach(item => {
        const abs = convertFontToAbsoluteUnits(item);
        sorted.push({
            orig: item,
            abs: abs,
            // TODO: refactor me
            isNegative: Math.sign(abs) === -1,
            normalized: Math.abs(abs)
        });
    });

    if (!sorted) {
        return false;
    }

    return sorted.sort(sortBy);
}

function sortNumbers(zIndices) {
    const sorted = zIndices;

    if (!sorted) {
        return false;
    }

    return sorted.sort((a, b) => a - b);
}

function sortColors(colors) {
    let sorted = colors;

    if (!sorted) {
        return false;
    }

    return sorted.sort((colorA, colorB) => {
        const a = colorA === 'inherit' ? 'transparent' : colorA;
        const b = colorB === 'inherit' ? 'transparent' : colorB;
        const colorAhsla = color.hsl(a);
        const colorBhsla = color.hsl(b);

        return colorAhsla.opacity - colorBhsla.opacity ||
            //colorBhsla.h - colorAhsla.h || could be sorted by hue, but make sense when 20+ colors
            colorBhsla.l - colorAhsla.l ||
            colorAhsla.s - colorBhsla.s;
    });
}

function parseSpaces(spacesArray) {
    if (!spacesArray) {
        return false;
    }

    let allMargins = [];

    spacesArray.forEach(declarationVal => {
        if (/calc/ig.test(declarationVal)) {
            return allMargins.push(declarationVal);
        }
        declarationVal.trim().split(/\s/).forEach(function (value) {
            allMargins.push(value);
        });
    });

    return _uniq(allMargins);
}

function size(stats) {
    return {
        raw: stats.size,
        zipped: stats.gzipSize,
        view: {
            raw: stats.humanizedSize,
            zipped: stats.humanizedGzipSize
        }
    };
}

function totals(stats) {
    if (!stats) {
        return false;
    }

    return {
        rules: humanize(stats.rules.total),
        selectors: humanize(stats.selectors.total),
        declarations: humanize(stats.declarations.total),
        properties: humanize(_size(stats.declarations.properties))
    };
}

function totalsDeclarations(stats) {
    let totals = [];
    const totalProperties = [
        'width',
        'height',
        'position',
        'float',
        'margin',
        'padding',
        'color',
        'background-color'
    ];

    totalProperties.forEach(property => {
        const prop = stats.declarations.properties[property];
        totals.push({
            name: property.replace('-', ' '),
            count: prop ? prop.length : 0
        });
    });

    totals.push({
        name: 'font size',
        count: stats.declarations.getAllFontSizes().length
    });

    return totals;
}

function uniques(stats) {
    if (!stats) {
        return false;
    }

    let uniques = {};
    const uniqueProperties = ['width', 'height', 'line-height', 'border-radius', 'z-index'];

    for (let property of uniqueProperties) {
        uniques[_camelCase(property)] = _uniq(stats.declarations.properties[property]);
    }

    uniques.color = sortColors(_uniq(stats.declarations.properties.color));
    uniques.backgroundColor = sortColors(_uniq(stats.declarations.properties['background-color']));
    uniques.fontSize = _uniq(stats.declarations.getAllFontSizes());
    uniques.fontFamily = sortFontFamilies(stats.declarations.getAllFontFamilies());
    uniques.fontSizeSorted = sortSizes(uniques.fontSize);
    uniques.zIndexSorted = sortNumbers(uniques.zIndex);
    uniques.mediaQueries = _uniq(stats.mediaQueries.values);
    uniques.margin = sortSizes(parseSpaces(stats.declarations.properties.margin));
    uniques.padding = sortSizes(parseSpaces(stats.declarations.properties.padding));

    return uniques;
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
        if (!uniques[camelKey]) {
            return false;
        }
        uniques[camelKey].chart = renderUniquesChart(uniques[camelKey], uniques.max);
    });

    return uniques;
}

function specificityChart(stats) {
    // simple array stats.selectors.getSpecificityGraph()
    return {
        'chart': renderLineChart(stats.selectors.getSpecificityValues()),
        'max': stats.selectors.specificity.max,
        'average': humanize(stats.selectors.specificity.average)
    };
}

function specificityTops(array) {
    let selectorsList = array;
    let heavySelectors = [];

    selectorsList.forEach(item => {
        if (parseFloat(item.specificity) > 32) {
            heavySelectors.push(item);
        }
    });

    heavySelectors.sort(function (a, b) {
        return parseFloat(b.specificity) - parseFloat(a.specificity);
    });

    return heavySelectors;
}

function ruleSizeChart(stats) {
    return {
        'chart': renderLineChart(stats.rules.selectorRuleSizes),
        'max': stats.rules.size.max,
        'average': humanize(stats.rules.size.average)
    };
}

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

    Object.keys(rulesetStat).forEach(key => {
        rulesetStat[key].sort(function (a, b) {
            return parseFloat(b.declarations) - parseFloat(a.declarations);
        });
    });

    return rulesetStat;
}

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

    longestSelectors.sort(function (a, b) {
        return parseFloat(b.selectors) - parseFloat(a.selectors);
    });

    return longestSelectors;
}

function selectors(selectors) {
    let universalSelectors = [];
    let jsPrefixedSelectors = [];
    let idSelectors = [];
    let attributeSelectors = 0;

    selectors.values.forEach(selector => {
        if (/^\*|\*$/.test(selector)) {
            universalSelectors.push(selector);
        }
        if (/js-/.test(selector)) {
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

function importantRules(rules) {
    const isHaveRules = rules !== undefined;
    return {
        'count': isHaveRules ? rules.length : 0,
        'rules': isHaveRules ? rules : []
    };
}

function statProject(stat) {
    let projectCssStat = [];

    stat.forEach(bundle => {
        const name = bundle.name;
        const stats = bundle.stat;

        return projectCssStat.push({
            name: name,
            size: size(stats),
            sizes: bundle.filesSizes !== undefined ? fileSizesChart(bundle.filesSizes) : '',
            totals: totals(stats),
            totalsDeclarations: totalsDeclarations(stats),
            uniques: uniques(stats),
            uniquesChart: uniquesChart(stats),
            specificityChart: specificityChart(stats),
            specificityTops: specificityTops(stats.selectors.getSpecificityValues()),
            rulesizeChart: ruleSizeChart(stats),
            rulesizeTops: ruleSizeStat(stats.rules.selectorRuleSizes),
            selectorsListTops: selectorsListTops(stats.selectors.selectorsLists),
            selectors: selectors(stats.selectors),
            importantRules: importantRules(stats.declarations.important)
        });
    });

    return projectCssStat;
}

module.exports = statProject;
