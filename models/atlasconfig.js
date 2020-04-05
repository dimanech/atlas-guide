'use strict';

const fs = require('fs');
const path = require('path');
const projectRoot = process.cwd();

const printMessage = require('./utils/printmessage');
const fillTemplatesConfig = (templatesConfig, internalTemplatesPath, name) => {
    let templates = {};

    fs.readdirSync(path.join(__dirname, internalTemplatesPath)).forEach(item => {
        templates[path.basename(item, '.mustache')] = '';
    });

    Object.keys(templates).forEach(template => {
        if (templatesConfig !== undefined && Object.hasOwnProperty.call(templatesConfig, template)) {
            const templatePath = path.join(projectRoot, templatesConfig[template]);
            if (fs.existsSync(templatePath)) {
                templates[template] = templatePath;
                return;
            } else {
                printMessage('warn', '"' + template + '" ' + name + ' is declared, but file not found. ' +
                    'Internal partial used for this include.');
            }
        }
        templates[template] = path.join(__dirname, internalTemplatesPath, template + '.mustache');
    });

    return templates;
};
const getConfig = require('./config/findconfig');

function getProjectInfo(config) {
    const pkg = require(path.join(projectRoot, 'package.json'));
    let projectName = 'atlas';

    if (config.projectInfo !== undefined && config.projectInfo.name) {
        projectName = config.projectInfo.name;
    } else {
        if (!pkg.name) {
            printMessage('warn', 'Neither "projectName" in atlas, nor "name" in package.json is declared. ' +
                '"atlas" name used instead.');
        } else {
            projectName = pkg.name.replace('/', '-'); // fix namespaced project names
        }
    }

    return {
        name: projectName,
        version: pkg.version || ''
    };
}

// function getPartialsConfig(config) {
//     let partials = fillTemplatesConfig(config.partials, '../views/includes/partials/', 'partial');
//
//     Object.keys(partials).forEach(function(partial) {
//         partials[partial] = fs.readFileSync(partials[partial], 'utf8');
//     });
//
//     return partials;
// }

function getBaseConfig(configRaw) {
    const config = getConfig(configRaw);
    if (config === undefined) {
        return { isCorrupted: true };
    }
    const baseMandatory = require('./config/configmandatory')(config);
    if (baseMandatory.isCorrupted) {
        return { isCorrupted: true };
    }

    const baseOptional = require('./config/configoptional')(config);

    const templates = { templates: fillTemplatesConfig(config.templates, '../views/templates/', 'template') };

    const constants = { constants: require('./config/constants')(config) };

    const getIndexPageSource = require('./config/indexpagesource');

    const additionalPages = {
        additionalPages: require('./config/additionalpages')(
            templates.templates,
            baseMandatory.guideDest,
            constants.constants,
            getIndexPageSource(projectRoot, baseMandatory.guideSrc, baseOptional.indexPageSource)
        )
    };

    const partials = { partials: fillTemplatesConfig(config.partials, '../views/includes/partials/', 'partial') };

    const projectInfo = { projectInfo: getProjectInfo(config) };

    return Object.assign({}, baseMandatory, baseOptional, templates, additionalPages, constants, partials, projectInfo);
}

module.exports = getBaseConfig;
