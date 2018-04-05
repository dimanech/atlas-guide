'use strict';

const _uniq = require('lodash.uniq');
const _camelCase = require('lodash.camelcase');

const sortFontFamilies = require('./sortFontFamilies');
const sortSizes = require('./sortSizes');
const sortColors = require('./sortColors');
const parseSpaces = require('./parseSpaces');

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
    uniques.zIndexSorted = uniques.zIndex.sort((a, b) => a - b);
    uniques.mediaQueries = _uniq(stats.mediaQueries.values);
    uniques.margin = sortSizes(parseSpaces(stats.declarations.properties.margin));
    uniques.padding = sortSizes(parseSpaces(stats.declarations.properties.padding));

    return uniques;
}

module.exports = uniques;
