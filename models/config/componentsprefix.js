'use strict';

const printMessage = require('../utils/printmessage');

function getComponentsPrefix(config) {
    const prefixes = config.componentPrefixes;
    let prefixExp = '';

    if (prefixes && !Array.isArray(prefixes)) {
        printMessage('warn', '"componentPrefixes" is defined, but it is not array. Default values used as fallback.');
    }

    if (Array.isArray(prefixes)) {
        prefixes.forEach(function(prefix) { // could be id or class
            prefixExp += `^.${prefix}|`;
        });
        prefixExp = prefixExp.replace(/\|$/g, '');
    } else {
        prefixExp = '^.b-|^.l-';
    }

    return new RegExp(prefixExp);
}

module.exports = getComponentsPrefix;
