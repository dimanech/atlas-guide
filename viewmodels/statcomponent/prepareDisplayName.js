'use strict';

function prepareDisplayName(name, singular) {
    let displayName;

    switch (name) {
        case 'fontFamily':
            displayName = singular ? 'Font family' : 'Font families';
            break;
        case 'fontSize':
            displayName = singular ? 'Font size' : 'Font sizes';
            break;
        case 'backgroundColor':
            displayName = singular ? 'Background' : 'Backgrounds';
            break;
        case 'mediaQuery':
            displayName = singular ? 'Media query' : 'Media queries';
            break;
        case 'boxShadow':
            displayName = 'Box shadow';
            break;
        default:
            displayName = singular ? name : name + 's';
    }

    return displayName;
}

module.exports = prepareDisplayName;
