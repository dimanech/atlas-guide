'use strict';

const path = require('path');
const fs = require('fs');

module.exports = function(atlasConfig, importsGraph) {
    // Utils
    const writePage = require(path.join(__dirname, 'utils/renderpage.js'));

    // Config
    const atlasBase = atlasConfig.getBase();
    const projectName = atlasConfig.getProjectInfo().projectInfo.name;
    const guideSrc = atlasBase.guideSrc;
    const guideDest = atlasBase.guideDest;
    const cssSrc = atlasBase.cssSrc;
    const templates = atlasBase.templates;
    const excludedCssFiles = atlasBase.excludedCssFiles;
    const excludedSassFiles = atlasBase.excludedSassFiles;

    // Models
    const projectStat = require(path.resolve(__dirname, '../models/projectcssstat.js'))(
        projectName, cssSrc, excludedCssFiles);
    const projectFileSizes = require(path.resolve(__dirname, '../models/projectfilesize.js'))(guideSrc);

    // View Models
    const statFileWeight = require(path.resolve(__dirname, '../viewmodels/statfileweight.js'));
    const statProject = require(path.resolve(__dirname, '../viewmodels/statproject.js'));
    const statImports = require(path.resolve(__dirname, '../viewmodels/statimports.js'));

    // Page configs
    const reportsPages = [{
        'id': 'bundle',
        'title': 'bundle',
        'target': path.join(guideDest, '/bundle.html'),
        'templateString': fs.readFileSync(templates.bundle, 'utf8'),
        'type': 'insights',
        'content': {
            weight: statFileWeight(projectFileSizes),
            imports: statImports(importsGraph, excludedSassFiles)
        }
    }, {
        'id': 'insides',
        'title': 'insides',
        'target': path.join(guideDest, '/insights.html'),
        'templateString': fs.readFileSync(templates.insights, 'utf8'),
        'type': 'insights',
        'content': statProject(projectStat, projectName)
    }];

    return Promise.all(reportsPages.map(writePage));
};
