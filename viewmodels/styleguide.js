'use strict';

module.exports = function(constants) {
    let constantsList = {
        'color': constants.color,
        'font': constants.font,
        'scale': constants.scale,
        'space': constants.space,
        'breakpoint': constants.breakpoint,
        'depth': constants.depth,
        'motion': constants.motion
    };

    constantsList.scale.sort((a, b) => b.valueUnitless - a.valueUnitless);
    constantsList.space.sort((a, b) => b.valueUnitless - a.valueUnitless);

    return constantsList;
};
