'use strict';

/*
 Based on https://github.com/bramstein/css-font-parser
 */

/**
 * @enum {number}
 */
var states = {
    VARIATION: 1,
    LINE_HEIGHT: 2,
    FONT_FAMILY: 3,
    BEFORE_FONT_FAMILY: 4
};

function isFontSize(buffer) {
    return (/^((xx|x)-large|(xx|s)-small|small|large|medium)$/.test(buffer) ||
        /^(larg|small)er$/.test(buffer) ||
        /^([+-])?([0-9]*\.)?[0-9]+(em|ex|ch|rem|vh|vw|vmin|vmax|px|mm|cm|in|pt|pc|%)$/.test(buffer));
}

function isLineHeight(buffer) {
    return /^([+-])?([0-9]*\.)?[0-9]+(em|ex|ch|rem|vh|vw|vmin|vmax|px|mm|cm|in|pt|pc|%)?$/.test(buffer);
}

/**
 * Attempt to parse a string as an identifier. Return
 * a normalized identifier, or null when the string
 * contains an invalid identifier.
 *
 * @param {string} str
 * @return {string|null}
 */
function parseIdentifier(str) {
    var identifiers = str.replace(/^\s+|\s+$/, '').replace(/\s+/g, ' ').split(' ');

    for (var i = 0; i < identifiers.length; i += 1) {
        if (/^(-?\d|--)/.test(identifiers[i]) ||
            !/^([_a-zA-Z0-9-]|[^\0-\237]|(\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?|\\[^\n\r\f0-9a-f]))+$/
                .test(identifiers[i])) {
            return null;
        }
    }
    return identifiers.join(' ');
}

function parseVariation(buffer, result) {
    switch (true) {
        case isFontSize(buffer):
            result['font-size'] = buffer;
            break;
        case /^(italic|oblique)$/.test(buffer):
            result['font-style'] = buffer;
            break;
        case /^small-caps$/.test(buffer):
            result['font-variant'] = buffer;
            break;
        case /^(bold(er)?|lighter|[1-9]00)$/.test(buffer):
            result['font-weight'] = buffer;
            break;
        case /^((ultra|extra|semi)-)?(condensed|expanded)$/.test(buffer):
            result['font-stretch'] = buffer;
            break;
    }
}

function getQuotedString(input, i, currentChar) {
    var startedQuote = currentChar;
    var closedQuote = i + 1;

    do {
        closedQuote = input.indexOf(startedQuote, closedQuote) + 1;
        if (!closedQuote) {
            // If a string is not closed by a ' or " return null.
            return null;
        }
    } while (input.charAt(closedQuote - 2) === '\\');

    return {
        string: input.slice(i, closedQuote),
        endPosition: closedQuote
    };
}

/**
 * @param {string} input
 * @return {Object|null}
 */
function parse(input) {
    var state = states.VARIATION,
        buffer = '',
        result = {
            'font-family': []
        };

    for (var i = 0; i < input.length; i += 1) {
        var currentChar = input.charAt(i);

        if (state === states.BEFORE_FONT_FAMILY && (currentChar === '"' || currentChar === '\'')) {
            var quotedStr = getQuotedString(input, i, currentChar);
            if (quotedStr === null) {
                return null;
            }
            result['font-family'].push(quotedStr.string);
            i = quotedStr.endPosition - 1;
            state = states.FONT_FAMILY;
            buffer = '';
        } else if (state === states.FONT_FAMILY && currentChar === ',') {
            state = states.BEFORE_FONT_FAMILY;
            buffer = '';
        } else if (state === states.BEFORE_FONT_FAMILY && currentChar === ',') {
            var identifier = parseIdentifier(buffer);
            if (identifier) {
                result['font-family'].push(identifier);
            }
            buffer = '';
        } else if (state === states.VARIATION && (currentChar === ' ' || currentChar === '/')) {
            parseVariation(buffer, result);
            if (isFontSize(buffer)) {
                state = currentChar === '/' ? states.LINE_HEIGHT : states.BEFORE_FONT_FAMILY;
            }
            buffer = '';
        } else if (state === states.LINE_HEIGHT && currentChar === ' ') {
            if (isLineHeight(buffer)) {
                result['line-height'] = buffer;
            }
            state = states.BEFORE_FONT_FAMILY;
            buffer = '';
        } else {
            buffer += currentChar;
        }
    }

    // This is for the case where a string was specified followed by
    // an identifier, but without a separating comma.
    if (state === states.FONT_FAMILY && !/^\s*$/.test(buffer)) {
        return null;
    }

    if (state === states.BEFORE_FONT_FAMILY) {
        var fontFamily = parseIdentifier(buffer);

        if (fontFamily) {
            result['font-family'].push(fontFamily);
        }
    }

    if (result['font-size'] && result['font-family'].length) {
        return result;
    } else {
        return null;
    }
}

module.exports = parse;
