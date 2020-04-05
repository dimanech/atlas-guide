'use strict';

function getUnitFromKeywords(keyword) {
    switch (keyword) {
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
        case 'larger':
            return 19;
        case 'x-large':
            return 24;
        case 'xx-large':
            return 32;
        default:
            return 0;
    }
}

function convertFontToAbsoluteUnits(value) {
    const rawValue = parseFloat(value);

    if (typeof value !== 'string') {
        value = value.toString();
    }

    if (value.match(/px$/)) {
        return rawValue;
    }
    if (value.match(/em$/)) {
        return rawValue * 16;
    }
    if (value.match(/%$/)) {
        return rawValue * 0.16;
    }

    return getUnitFromKeywords(value);
}

function sortSizes(size) {
    if (!size) {
        return false;
    }
    let result = [];
    const sortBy = (a, b) => {
        if (a.abs > b.abs) {
            return -1;
        }
        if (a.abs < b.abs) {
            return 1;
        }

        if (a.orig > b.orig) {
            return 1;
        }
        if (a.orig < b.orig) {
            return -1;
        }

        return 0;
    };

    size.forEach(item => {
        const abs = convertFontToAbsoluteUnits(item);
        return result.push({
            orig: item,
            abs: abs,
            isNegative: Math.sign(abs) === -1,
            normalized: Math.abs(abs)
        });
    });

    return result.sort(sortBy);
}

module.exports = sortSizes;
