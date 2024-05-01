import path, { dirname } from 'node:path';
import getComponentsPrefix from './componentsprefix.mjs';
// __dirname simulation inside ES modules
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getOptionalBaseConfigs(config) {
    let atlasConfig = {};

    // Optional configs
    atlasConfig.scssAdditionalImportsArray = config.scssAdditionalImportsArray || [];

    atlasConfig.excludedDirs = new RegExp(config.excludedDirs || '.^');
    atlasConfig.excludedCssFiles = new RegExp(config.excludedCssFiles || '.^');
    atlasConfig.excludedSassFiles = new RegExp(config.excludedSassFiles || '.^');

    const copyInternalAssets = config.copyInternalAssets;
    atlasConfig.copyInternalAssets = copyInternalAssets !== undefined ? copyInternalAssets : true;
    atlasConfig.internalAssetsPath = path.join(__dirname, '../../assets');

    atlasConfig.componentPrefixes = getComponentsPrefix(config);
    atlasConfig.indexPageSource = config.indexPageSource;

    return atlasConfig;
}

export default getOptionalBaseConfigs;
