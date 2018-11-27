'use strict';

const fs = require('fs');
const path = require('path');
const projectRoot = process.cwd();

const printMessage = require('./utils/printmessage');

function getComponentsPrefix(config) {
    const prefixes = config.componentPrefixes;
    let prefixExp = '';

    if (prefixes && !Array.isArray(prefixes)) {
        printMessage('warn', '"componentPrefixes" is defined, but it is not array. Default values used as fallback.');
    }

    if (Array.isArray(prefixes)) {
        prefixes.forEach(function (prefix) { // could be id or class
            prefixExp += `^.${prefix}|`;
        });
        prefixExp = prefixExp.replace(/\|$/g, '');
    } else {
        prefixExp = '^.b-|^.l-';
    }

    return new RegExp(prefixExp);
}

function isPathConfigured(config, name) {
    if (!config) {
        printMessage('error', '"' + name + '" not defined. This config is required.');
        return true;
    } else if (!fs.existsSync(path.join(projectRoot, config))) {
        printMessage('error', '"' + name + '" (' + config + ') in config unavailable or unreadable. ' +
            'Please check this path in config.');
        return true;
    } else {
        return false;
    }
}

function fillTemplatesConfig(templatesConfig, internalTemplatesPath, name) {
    let templates = {};

    fs.readdirSync(path.join(__dirname, internalTemplatesPath)).forEach(function(item) {
        templates[path.basename(item, '.mustache')] = '';
    });

    Object.keys(templates).forEach(template => {
        if (templatesConfig !== undefined && templatesConfig.hasOwnProperty(template)) {
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
}

function getConfig(configSrc) {
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

function getProjectInfo(configRaw) {
    const config = getConfig(configRaw);
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
        'name': projectName,
        'version': pkg.version || ''
    };
}

function getMandatoryBaseConfig(config) {
    let atlasConfig = {};
    if (isPathConfigured(config.guideSrc, 'guideSrc') ||
        isPathConfigured(config.guideDest, 'guideDest') ||
        isPathConfigured(config.cssSrc, 'cssSrc')) {
        return { isCorrupted: true }; // return with corrupted config if we don't have crucial fields
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
                'unreadable. "cssSrc" directory used as fallback.');
        } else {
            atlasConfig.scssSrc = scssSrc;
        }
    }

    return atlasConfig;
}

function getOptionalBaseConfigs(config) {
    let atlasConfig = {};

    // Optional configs
    atlasConfig.scssAdditionalImportsArray = config.scssAdditionalImportsArray || [];

    atlasConfig.excludedDirs = new RegExp(config.excludedDirs || '.^', 'g');
    atlasConfig.excludedCssFiles = new RegExp(config.excludedCssFiles || '.^', 'g');
    atlasConfig.excludedSassFiles = new RegExp(config.excludedSassFiles || '.^', 'g');

    const copyInternalAssets = config.copyInternalAssets;
    atlasConfig.copyInternalAssets = copyInternalAssets !== undefined ? copyInternalAssets : true;
    atlasConfig.internalAssetsPath = path.join(__dirname, '../assets');

    atlasConfig.componentPrefixes = getComponentsPrefix(config);

    return atlasConfig;
}

function getTemplates(config) {
    return fillTemplatesConfig(config.templates, '../views/templates/', 'template');
}

function getAdditionalPages(templates, dest, constants) {
    let additionalPages = [];
    const readmySrc = path.join(projectRoot, 'README.md');

    additionalPages.push({
        'id': 'index',
        'title': 'About',
        'src': fs.existsSync(readmySrc) ? readmySrc : '',
        'target': path.join(dest, '/index.html'),
        'template': templates.about,
        'type': 'about',
        'isDeprecated': false,
        'subPages': []
    });

    if (constants.isDefined) {
        additionalPages.push({
            'id': 'styleguide',
            'title': 'Styleguide',
            'src': '',
            'target': path.join(dest, '/styleguide.html'),
            'template': templates.styleguide,
            'type': 'styleguide',
            'isDeprecated': false,
            'subPages': []
        });
    }

    return additionalPages;
}

function getDeclaredConstants(configRaw) {
    const config = getConfig(configRaw);
    const constantsList = [
        'colorPrefix',
        'fontPrefix',
        'scalePrefix',
        'spacePrefix',
        'motionPrefix',
        'depthPrefix',
        'breakpointPrefix'
    ];
    let projectConstants = {
        'isDefined': false,
        'constantsList': []
    };

    if (config.projectConstants !== undefined && config.projectConstants.constantsSrc !== undefined) {
        const constantsSrc = path.join(projectRoot, config.projectConstants.constantsSrc);
        // check if constantsSrc exist
        if (fs.existsSync(constantsSrc)) {
            projectConstants.isDefined = true;
            projectConstants.constantsSrc = constantsSrc;
            projectConstants.constantsFile = fs.readFileSync(constantsSrc, 'utf8');
        } else {
            printMessage('warn', '"projectConstants" is declared, but constants file not found (' + constantsSrc +
                '). Constants could not be fetched.');
        }
    } else {
        return projectConstants;
    }

    constantsList.forEach(constant => {
        const internalConstantName = constant.replace(/Prefix/g, ''); // remove "Prefix" from "colorPrefix" string
        const declaredConstantName = config.projectConstants[constant];

        return projectConstants.constantsList.push({
            'name': internalConstantName,
            'regex': new RegExp(declaredConstantName !== undefined ? '(\\$|--)' + declaredConstantName : '.^')
        });
    });

    return projectConstants;
}

function getBaseConfig(configRaw) {
    const config = getConfig(configRaw);
    if (config === undefined) {
        return { isCorrupted: true };
    }
    const baseMandatory = getMandatoryBaseConfig(config);
    if (baseMandatory.isCorrupted) {
        return { isCorrupted: true };
    }
    const baseOptional = getOptionalBaseConfigs(config);
    const templates = {templates: getTemplates(config)};
    const constants = {constants: getDeclaredConstants(config)};
    const additionalPages = {additionalPages: getAdditionalPages(
        templates.templates, baseMandatory.guideDest, constants.constants)};

    return Object.assign({}, baseMandatory, baseOptional, templates, additionalPages, constants);
}

function getPartialsConfig(configRaw) {
    const config = getConfig(configRaw);
    let partials = fillTemplatesConfig(config.partials, '../views/includes/partials/', 'partial');

    Object.keys(partials).forEach(function (partial) {
        partials[partial] = fs.readFileSync(partials[partial], 'utf8');
    });

    return partials;
}

module.exports = {
    'getProjectInfo': getProjectInfo,
    'getBase': getBaseConfig,
    'getPartials': getPartialsConfig
};
