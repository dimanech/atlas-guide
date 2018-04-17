'use strict';

const fontParser = require('./cssfontparser.js');

function getFont(value) {
    const parse = fontParser(value);
    const result = {
        fontSize: '',
        fontFamily: ''
    };

    if (parse) {
        result.fontSize = parse['font-size'];
        result.fontFamily = parse['font-family'];
    }

    return {
        fontSize: result.fontSize,
        fontFamily: result.fontFamily
    };
}

module.exports = getFont;
