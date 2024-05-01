import { hsl } from 'd3-color';

function getBackgroundColor(value) {
    const finalLayer = value.split(',');
    const layerPropsList = finalLayer.pop().split(' ');
    let backgroundColors = [];

    layerPropsList.forEach(prop => {
        if (hsl(prop).displayable() || /(^\$|^--)/.test(prop)) {
            return backgroundColors.push(prop);
        }
    });

    return backgroundColors;
}

export default getBackgroundColor;
