'use strict';

const color = require('d3-color');

function getBackgroundStat(value) {
    const finalLayer = value.split(',');
    const layerPropsList = finalLayer.pop().split(' ');
    let backgroundColors = [];

    layerPropsList.forEach(prop => {
        if (color.hsl(prop).displayable() || /(^\$|^--)/.test(prop)) {
            return backgroundColors.push(prop);
        }
    });

    return backgroundColors;
}

module.exports = getBackgroundStat;
