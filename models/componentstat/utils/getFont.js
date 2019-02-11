'use strict';

const fontParser = require('./cssfontparser.js');
const quoteFamily = family =>
    /^(serif|sans-serif|monospace|cursive|fantasy|\$[a-zA-z]*)$/.test(family) ? family : ('"' + family + '"');

function prepareFontData(input) {
    if (/^(inherit|initial)$/.test(input)) {
        return {
            'font-size': input,
            'line-height': input,
            'font-style': input,
            'font-weight': input,
            'font-variant': input,
            'font-stretch': input,
            'font-family': input
        };
    }

    input = input.replace(/\s*\/\s*/, '/');
    let result = fontParser(input);

    if (result) {
        result['font-family'] = result['font-family'].map(quoteFamily).join(', ');
    }

    return result;
}

module.exports = function (value) {
    const parseFontString = prepareFontData(value);
    return {
        fontSize: parseFontString['font-size'] || '',
        fontFamily: parseFontString['font-family'] || ''
    };
};
