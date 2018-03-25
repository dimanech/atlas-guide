'use strict';

module.exports = function(text, render) {
    const args = render(text).split(',');
    const singular = args[1];
    const plural = args[2];
    return parseFloat(args[0]) === 1 ? singular : plural;
};
