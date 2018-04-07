'use strict';

const _camelCase = require('lodash.camelcase');
const getFontStat = require('./getFontStat');
const getBackgroundStat = require('./getBackgroundStat');
const getMetricStat = require('./getMetricStat');

function getPropsStat(decl, stats, variables) {
    [
        // health
        'float',
        // useful
        'z-index',
        // component profile
        'width',
        'height',
        'position',
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

    if (/^-/.test(decl.prop) || /^-/.test(decl.value)) {
        stats.vendorPrefix.push({
            prop: decl.prop,
            value: decl.value
        });
    }

    // Useful

    if (/(^\$|^--)/.test(decl.prop)) {
        variables.push({
            prop: decl.prop,
            value: decl.value
        });
    }

    // Profile

    ['margin', 'padding'].forEach(item => stats[item].concat(getMetricStat(item, decl)));

    if (decl.prop === 'display') { // only layout display. Check probability of block, i-b usage in components?
        if (/(flex|grid)/.test(decl.value)) {
            stats.display.push(decl.value);
        }
    }

    if (decl.prop === 'background') {
        stats.backgroundColor.concat(getBackgroundStat(decl.value));
    }

    if (decl.prop === 'font') {
        const fontStat = getFontStat(decl.value);
        stats.fontSize.push(fontStat.fontSize);
        stats.fontFamily.push(fontStat.fontFamily);
    }
}

module.exports = getPropsStat;
