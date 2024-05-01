import _camelCase from 'lodash.camelcase';
import getFont from './utils/getFont.mjs';
import getBackgroundColor from './utils/getBackgroundColor.mjs';
import getMetric from './utils/getMetric.mjs';

function getPropsStat(decl, stats) {
    [
        // Health
        'float',
        // Useful
        'z-index',
        // Constants
        'color',
        'background-color',
        'font-family',
        'font-size',
        'box-shadow'
    ].forEach(prop => {
        if (decl.prop === prop.toString()) {
            stats[_camelCase(prop)].push(decl.value);
        }
    });

    // Health

    if (decl.important) {
        stats.important.push({
            prop: decl.prop
        });
    }

    if (/^-/.test(decl.prop) || /^-[\D]/.test(decl.value)) {
        stats.vendorPrefix.push({
            prop: decl.prop,
            value: decl.value
        });
    }

    // Constants

    ['margin', 'padding'].forEach(item => {
        const stat = getMetric(item, decl);
        if (stat !== null) {
            stats[item] = stats[item].concat(stat);
        }
    });

    if (decl.prop === 'background') {
        stats.backgroundColor = stats.backgroundColor.concat(getBackgroundColor(decl.value));
    }

    if (decl.prop === 'font') {
        const fontStat = getFont(decl.value);
        stats.fontSize.push(fontStat.fontSize);
        stats.fontFamily.push(fontStat.fontFamily);
    }
}

function getVariables(decl, variables) {
    if (/(^\$|^--)/.test(decl.prop)) {
        variables.push({
            prop: decl.prop,
            value: decl.value
        });
    }
}

function getPropertiesStats(fileAST) {
    let stats = {
        'fontSize': [],
        'fontFamily': [],
        'margin': [],
        'padding': [],
        'color': [],
        'backgroundColor': [],
        'important': [],
        'vendorPrefix': [],
        'zIndex': [],
        'float': [],
        'boxShadow': []
    };
    let totalDeclarations = 0;
    let variables = [];

    fileAST.walkDecls(function(decl) {
        if (decl.parent.selector !== undefined && /^\d/.test(decl.parent.selector)) {
            // ignore animation declaration blocks
            return;
        }

        totalDeclarations++;
        getPropsStat(decl, stats);
        getVariables(decl, variables);
    });

    return {
        stats: stats,
        totalDeclarations: totalDeclarations,
        variables: variables
    };
}

export default getPropertiesStats;
