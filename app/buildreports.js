'use strict';

const path = require('path');

module.exports = function(atlasConfig, projectTree, importsGraph, writePage) {
    // Config
    const projectName = atlasConfig.projectInfo.name;
    const guideSrc = atlasConfig.guideSrc;
    const guideDest = atlasConfig.guideDest;
    const cssSrc = atlasConfig.cssSrc;
    const excludedCssFiles = atlasConfig.excludedCssFiles;
    const excludedSassFiles = atlasConfig.excludedSassFiles;

    // Models
    const cssStat = require(path.resolve(__dirname, '../models/projectcssstat.js'))(
        projectName, cssSrc, excludedCssFiles);
    const projectFileSizes = require(path.resolve(__dirname, '../models/projectfilesize.js'))(guideSrc);
    const bundle = require(path.resolve(__dirname, '../models/projectbundle.js'))(
        importsGraph, projectName, cssSrc, excludedSassFiles);

    // View Models
    const statFileWeight = require(path.resolve(__dirname, '../viewmodels/statfileweight.js'));
    const statProject = require(path.resolve(__dirname, '../viewmodels/statproject.js'));
    const statCrossDeps = require(path.resolve(__dirname, '../viewmodels/statcrossdeps.js'));
    const statImports = require(path.resolve(__dirname, '../viewmodels/statimports.js'));

    // Page configs
    const reportsPages = [{
        id: 'bundle',
        title: 'bundle',
        target: path.join(guideDest, '/bundle.html'),
        template: 'bundle',
        type: 'insights', // TODO: ??
        content: {
            weight: statFileWeight(projectFileSizes),
            crossDeps: statCrossDeps(importsGraph, excludedSassFiles),
            tree: bundle,
            bundleImports: statImports(importsGraph, excludedSassFiles)
        }
    }, {
        id: 'insights',
        title: 'insights',
        target: path.join(guideDest, '/insights.html'),
        template: 'insights',
        type: 'insights',
        content: statProject(cssStat, projectName)
    }];

    return {
        buildReports: () => Promise.all(reportsPages.map(writePage))
    };
};
