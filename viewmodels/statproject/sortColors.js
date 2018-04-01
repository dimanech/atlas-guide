'use strict';

const color = require('d3-color');

function sortColors(colors) {
    let sorted = colors;

    if (!sorted) {
        return false;
    }

    return sorted.sort((colorA, colorB) => {
        const a = colorA === 'inherit' ? 'transparent' : colorA;
        const b = colorB === 'inherit' ? 'transparent' : colorB;
        const colorAhsla = color.hsl(a);
        const colorBhsla = color.hsl(b);

        return colorAhsla.opacity - colorBhsla.opacity ||
            //colorBhsla.h - colorAhsla.h || could be sorted by hue, but make sense when 20+ colors
            colorBhsla.l - colorAhsla.l ||
            colorAhsla.s - colorBhsla.s;
    });
}

module.exports = sortColors;
