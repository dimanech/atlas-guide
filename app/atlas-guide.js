'use strict';

const path = require('path');

function withConfig(configPath) {
    // Prepare config and basic models
    const atlasConfig = require(path.resolve(__dirname, '../models/atlasconfig.js'))(configPath);

    // If config has no proper fields
    if (atlasConfig.isCorrupted) {
        return {
            'build': () => new Promise(resolve => resolve('Config is corrupted')),
            'buildAll': () => new Promise(resolve => resolve('Config is corrupted'))
        };
    }

    const projectTree = require(path.resolve(__dirname, '../models/projectdocumentedtree.js'))(atlasConfig);
    const projectImports = require(path.resolve(__dirname, '../models/projectimportsgraph.js'));
    const projectImportsGraph = projectImports.getImportsGraph(atlasConfig);

    // Prepare Utils based on config
    const writePage = require('./utils/writepage.js')(atlasConfig, projectTree).writePage;

    const buildComponent = require('./buildcomponet.js')(atlasConfig, projectTree, projectImportsGraph,
        projectImports, writePage).buildComponent;
    const buildReports = require('./buildreports.js')(atlasConfig, projectTree, projectImportsGraph,
        writePage).buildReports;

    // Copy internal assets to the components destinations
    if (atlasConfig.copyInternalAssets) {
        require(path.join(__dirname, '/utils/copyassets.js'))(atlasConfig.internalAssetsPath, atlasConfig.guideDest);
    }

    return {
        'build': buildComponent,
        'buildAll': () => Promise.all([
            buildComponent(),
            buildReports()
        ])
    };
}

module.exports = { withConfig };
