'use strict';

const path = require('path');
const getComponentsPrefix = require('./componentsprefix');

function getOptionalBaseConfigs(config) {
    let atlasConfig = {};

    // Optional configs
    atlasConfig.scssAdditionalImportsArray = config.scssAdditionalImportsArray || [];

    atlasConfig.excludedDirs = new RegExp(config.excludedDirs || '.^', 'g');
    atlasConfig.excludedCssFiles = new RegExp(config.excludedCssFiles || '.^', 'g');
    atlasConfig.excludedSassFiles = new RegExp(config.excludedSassFiles || '.^', 'g');

    const copyInternalAssets = config.copyInternalAssets;
    atlasConfig.copyInternalAssets = copyInternalAssets !== undefined ? copyInternalAssets : true;
    atlasConfig.internalAssetsPath = path.join(__dirname, '../../assets');

    atlasConfig.componentPrefixes = getComponentsPrefix(config);
    atlasConfig.indexPageSource = config.indexPageSource;

    return atlasConfig;
}

module.exports = getOptionalBaseConfigs;
