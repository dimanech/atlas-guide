'use strict';

const color = require('d3-color');

function categorizeValue(color) {
    if (color === 'inherit') { // make inherit equal to transparent, because we could not get the value of inherit
        return 'transparent';
    } else if (/var\(/g.test(color)) { // make vars declaration equal to black, so they appear at the end
        return '#000';
    } else {
        return color;
    }
}

function sortColors(colors) {
    return colors.sort((colorA, colorB) => {
        const colorAhsla = color.hsl(categorizeValue(colorA));
        const colorBhsla = color.hsl(categorizeValue(colorB));

        return colorAhsla.opacity - colorBhsla.opacity ||
            //colorBhsla.h - colorAhsla.h || could be sorted by hue, but make sense when 20+ colors
            colorBhsla.l - colorAhsla.l ||
            colorAhsla.s - colorBhsla.s;
    });
}

module.exports = sortColors;
