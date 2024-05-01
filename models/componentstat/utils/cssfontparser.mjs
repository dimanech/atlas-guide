/*
 Based on https://github.com/bramstein/css-font-parser
 */

/**
 * @enum {number}
 */
const states = {
    VARIATION: 1,
    LINE_HEIGHT: 2,
    FONT_FAMILY: 3,
    BEFORE_FONT_FAMILY: 4
};

function isLineHeight(string) {
    return (/^([+-])?([0-9]*\.)?[0-9]+(em|ex|ch|rem|vh|vw|vmin|vmax|px|mm|cm|in|pt|pc|%)?$/.test(string));
}

function isFontSize(string) {
    return (/^([+-])?([0-9]*\.)?[0-9]+(em|ex|ch|rem|vh|vw|vmin|vmax|px|mm|cm|in|pt|pc|%)$/.test(string) ||
        /^((xx|x)-large|(xx|s)-small|small|large|medium)$/.test(string) ||
        /^(larg|small)er$/.test(string));
}

function unqote(string) {
    return string.replace(/^["']|["']$/g, '');
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
    let identifiers = str.replace(/^\s+|\s+$/, '').replace(/\s+/g, ' ').split(' ');

    for (let i = 0; i < identifiers.length; i += 1) {
        if (/^(-?\d|--)/.test(identifiers[i]) ||
            !/^([$_a-zA-Z0-9-]|[^\0-\237]|(\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?|\\[^\n\r\f0-9a-f]))+$/
                .test(identifiers[i])) {
            return null;
        }
    }

    return identifiers.join(' ');
}

function variationType(string) {
    let type = '';

    switch (true) {
        case isFontSize(string):
            type = 'font-size';
            break;
        case /^(italic|oblique)$/.test(string):
            type = 'font-style';
            break;
        case /^small-caps$/.test(string):
            type = 'font-variant';
            break;
        case /^(bold(er)?|lighter|[1-9]00)$/.test(string):
            type = 'font-weight';
            break;
        case /^((ultra|extra|semi)-)?(condensed|expanded)$/.test(string):
            type = 'font-stretch';
            break;
    }

    return type;
}

/**
 * @param {string} input - full string to parse
 * @param {number} index - current character index
 * @param {string} quoteChar - current character value
 * @return {object|null}
 */
function getQuotedString(input, index, quoteChar) {
    let closedQuoteIndex = index + 1;

    do {
        closedQuoteIndex = input.indexOf(quoteChar, closedQuoteIndex) + 1;
        if (!closedQuoteIndex) {
            // If a string is not closed by a ' or " return null.
            return null;
        }
    } while (input.charAt(closedQuoteIndex - 2) === '\\');

    return {
        content: input.slice(index, closedQuoteIndex),
        endPosition: closedQuoteIndex
    };
}

/**
 * @param {string} input
 * @return {Object|null}
 */
function fontParser(input) {
    let state = states.VARIATION,
        buffer = '',
        result = {
            'font-family': []
        };

    for (let i = 0; i < input.length; i += 1) {
        const currentChar = input.charAt(i);

        if (state === states.BEFORE_FONT_FAMILY && (currentChar === '"' || currentChar === '\'')) {
            const quotedStr = getQuotedString(input, i, currentChar);
            if (quotedStr === null) {
                return null; // parse() return null if closed quote not found
            }
            result['font-family'].push(unqote(quotedStr.content));
            i = quotedStr.endPosition - 1;
            state = states.FONT_FAMILY;
            buffer = '';
        } else if (state === states.FONT_FAMILY && currentChar === ',') {
            state = states.BEFORE_FONT_FAMILY;
            buffer = '';
        } else if (state === states.BEFORE_FONT_FAMILY && currentChar === ',') {
            const identifier = parseIdentifier(buffer);
            if (identifier) {
                result['font-family'].push(unqote(identifier));
            }
            buffer = '';
        } else if (state === states.VARIATION && (currentChar === ' ' || currentChar === '/')) {
            const variation = variationType(buffer);
            if (variation) {
                result[variation] = buffer;
            }
            if (variation === 'font-size') {
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
        const fontFamily = parseIdentifier(buffer);

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

export default fontParser;
