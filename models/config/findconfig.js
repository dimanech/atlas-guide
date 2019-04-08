'use strict';

const fs = require('fs');
const path = require('path');
const projectRoot = process.cwd();
const printMessage = require('../utils/printmessage');

function findConfig(config) {
    if (config !== undefined) {
        if (typeof config === 'object') {
            return config;
        }
        const configPath = path.join(projectRoot, config);
        if (fs.existsSync(configPath)) {
            return require(configPath);
        }
    }

    printMessage('error', 'Could not find Atlas configuration. Please pass path to config ' +
        'or raw config object into atlas.withConfig()');

    return undefined;
}

module.exports = findConfig;
