const removeUnits = val => val.replace(/[a-z]/g, '');

export default function(constants) {
    let constantsList = {
        'color': constants.color,
        'font': constants.font,
        'scale': constants.scale,
        'space': constants.space,
        'breakpoint': constants.breakpoint,
        'depth': constants.depth,
        'motion': constants.motion
    };

    constantsList.scale.sort((a, b) => removeUnits(b.value) - removeUnits(a.value));
    constantsList.space.sort((a, b) => removeUnits(b.value) - removeUnits(a.value));
    constantsList.breakpoint.sort((a, b) => removeUnits(a.value) - removeUnits(b.value));

    constantsList.breakpointGraph = JSON.stringify(constantsList.breakpoint.map(item => removeUnits(item.value)));

    return constantsList;
};
