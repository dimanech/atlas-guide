'use strict';

const fs = require('fs');
const path = require('path');
const projectRoot = process.cwd();
const printMessage = require('../utils/printmessage');
const isPathConfigured = require('./utils').isPathConfigured;

function getMandatoryBaseConfig(config) {
    let atlasConfig = {};
    if (isPathConfigured(config.guideSrc, 'guideSrc') ||
        isPathConfigured(config.guideDest, 'guideDest') ||
        isPathConfigured(config.cssSrc, 'cssSrc')) {
        return {isCorrupted: true}; // return with corrupted config if we don't have crucial fields
    }

    // Process mandatory configs
    atlasConfig.guideSrc = path.join(projectRoot, config.guideSrc, '/');
    atlasConfig.guideDest = path.join(projectRoot, config.guideDest, '/');
    atlasConfig.cssSrc = path.join(projectRoot, config.cssSrc, '/');

    if (config.scssSrc === undefined) {
        atlasConfig.scssSrc = atlasConfig.guideSrc;
    } else {
        const scssSrc = path.join(projectRoot, config.scssSrc, '/');
        if (!fs.existsSync(scssSrc)) {
            atlasConfig.scssSrc = atlasConfig.guideSrc;
            printMessage('warn', '"scssSrc" is defined, but directory (' + config.scssSrc + ') unavailable or ' +
                'unreadable. "cssSrc" directory used as fallback');
        } else {
            atlasConfig.scssSrc = scssSrc;
        }
    }

    return atlasConfig;
}

module.exports = getMandatoryBaseConfig;
