'use strict';

const path = require('path');
const fs = require('fs');

module.exports = function(atlasConfig, projectDocumentedTree, importsGraph) {
    // Utils
    const writePage = require(path.join(__dirname, 'utils/renderpage.js'));

    // Config
    const atlasBase = atlasConfig.getBase();
    const projectName = atlasConfig.getProjectInfo().projectInfo.name;
    const guideDest = atlasBase.guideDest;
    const cssSrc = atlasBase.cssSrc;
    const templates = atlasBase.templates;
    const excludedCssFiles = atlasBase.excludedCssFiles;
    const excludedSassFiles = atlasBase.excludedSassFiles;

    // Models
    const projectStat = require(path.resolve(__dirname, '../models/projectcssstat.js'))(
        projectName, cssSrc, excludedCssFiles);

    // View Models
    const statFileWeight = require(path.resolve(__dirname, '../viewmodels/statfileweight.js'));
    const statProject = require(path.resolve(__dirname, '../viewmodels/statproject.js'));
    const statImports = require(path.resolve(__dirname, '../viewmodels/statimports.js'));

    writePage({
        'id': 'sizes',
        'title': 'sizes',
        'target': path.join(guideDest, '/sizes.html'),
        'templateString': fs.readFileSync(templates.sizes, 'utf8'),
        'type': 'insights',
        'subPages': projectDocumentedTree.subPages,
        'content': statFileWeight(importsGraph, projectName, cssSrc)
    });

    writePage({
        'id': 'imports',
        'title': 'imports',
        'target': path.join(guideDest, '/imports.html'),
        'templateString': fs.readFileSync(templates.imports, 'utf8'),
        'type': 'imports',
        'subPages': projectDocumentedTree.subPages,
        'content': statImports(importsGraph, excludedSassFiles)
    });

    writePage({
        'id': 'insides',
        'title': 'insides',
        'target': path.join(guideDest, '/insights.html'),
        'templateString': fs.readFileSync(templates.insights, 'utf8'),
        'type': 'insights',
        'subPages': projectDocumentedTree.subPages,
        'content': statProject(projectStat, projectName)
    });
};
