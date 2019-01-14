'use strict';

const fs = require('fs');
const path = require('path');
const projectRoot = process.cwd();
const printMessage = require('../utils/printmessage');

function isPathConfigured(config, name) {
    if (!config) {
        printMessage('error', '"' + name + '" not defined. This field is mandatory');
        return true;
    } else if (!fs.existsSync(path.join(projectRoot, config))) {
        printMessage('error', '"' + name + '" (' + config + ') in config unavailable or unreadable. ' +
            'Please check this path in config');
        return true;
    } else {
        return false;
    }
}

module.exports = {
    isPathConfigured: isPathConfigured
};
