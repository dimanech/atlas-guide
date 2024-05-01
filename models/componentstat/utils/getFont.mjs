import fontParser from './cssfontparser.mjs';

const quoteFamily = family =>
    /^(serif|sans-serif|monospace|cursive|fantasy|\$[a-zA-Z]*)$/.test(family) ? family : ('"' + family + '"');

function prepareFontData(input) {
    if (/^(inherit|initial)$/.test(input)) {
        return {
            fontSize: input,
            fontFamily: input
        };
    }

    input = input.replace(/\s*\/\s*/, '/');
    let result = fontParser(input);

    if (result) {
        return {
            fontSize: result['font-size'],
            fontFamily: result['font-family'].map(quoteFamily).join(', ')
        };
    } else {
        return {
            fontSize: '',
            fontFamily: ''
        };
    }
}

export default prepareFontData;
