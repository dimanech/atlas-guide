'use strict';

const fs = require('fs');
const path = require('path');
const projectRoot = process.cwd();
const printMessage = require('../utils/printmessage');

function findConfig(configSrc) {
    const pkg = require(path.join(projectRoot, 'package.json'));

    if (configSrc !== undefined) { // need for tests mostly. Any object could be passed as config.
        return configSrc;
    }
    if (fs.existsSync(path.join(projectRoot, '.atlasrc.json'))) {
        return require(path.join(projectRoot, '.atlasrc.json'));
    }
    if (pkg.atlasConfig !== undefined) {
        return pkg.atlasConfig;
    }

    printMessage('error', 'Could not find Atlas configuration. Please create file ".atlasrc.json" or add ' +
        '"atlasConfig" in "package.json"');

    return undefined;
}

module.exports = findConfig;
