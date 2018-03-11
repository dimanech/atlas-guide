'use strict';

const fs = require('fs');
const path = require('path');
const projectRoot = process.cwd();

function printMessage(type, message) {
    const colorizeYellow = str => '\x1b[33m' + str + '\x1b[0m';
    const colorizeRed = str => '\x1b[31m' + str + '\x1b[0m';

    switch (type) {
        case 'error': {
            console.error(colorizeRed('Error: ') + 'Atlas: ' + message);
            break;
        }
        case 'warn': {
            console.warn(colorizeYellow('Warn: ') + 'Atlas: ' + message);
            break;
        }
        default: {
            console.log('Atlas: ' + message);
        }
    }
}

function getConfig(configSrc) {
    const pkg = require(path.join(projectRoot, 'package.json'));

    if (configSrc !== undefined) {
        return configSrc;
    }
    if (fs.existsSync(path.join(projectRoot, '.atlasrc.json'))) {
        return require(path.join(projectRoot, '.atlasrc.json'));
    }
    if (pkg.atlasConfig !== undefined) {
        return pkg.atlasConfig;
    }

    printMessage('error', 'Could not find Atlas configuration. Please create file ".atlasrc.json" or add ' +
        '"atlasConfig" to "package.json"');
    return {};
}

function getComponentsPrefix(config) {
    const prefixes = config.componentPrefixes;
    let prefixExp = '';

    if (prefixes && !Array.isArray(prefixes)) {
        printMessage('warn', '"componentPrefixes" is defined, but it is not array. Default values used as fallback.');
    }

    if (Array.isArray(prefixes)) {
        prefixes.forEach(prefix => prefixExp += `^.${prefix}|`); // could be id or class
        prefixExp = prefixExp.replace(/\|$/g, '');
    } else {
        prefixExp = '^.b-|^.l-';
    }

    return new RegExp(prefixExp);
}

function getBaseConfig(configRaw) {
    let atlasConfig = {
        'isCorrupted': false
    };
    const config = getConfig(configRaw);

    function getBase() {
        if (atlasConfig.isCorrupted) {
            return;
        }

        if (!config.guideSrc) {
            printMessage('error', '"guideSrc" not defined. This config is required.');
            atlasConfig.isCorrupted = true;
            return;
        }

        if (!fs.existsSync(path.join(projectRoot, config.guideSrc))) {
            printMessage('error', '"guideSrc" (' + config.guideSrc + ') in config unavailable or unreadable. ' +
                'Please check this path in config.');
            atlasConfig.isCorrupted = true;
            return;
        }

        if (!config.guideDest) {
            printMessage('error', '"guideDest" not defined. This config is required.');
            atlasConfig.isCorrupted = true;
            return;
        }

        if (!fs.existsSync(path.join(projectRoot, config.guideDest))) {
            printMessage('error', '"guideDest" directory (' + config.guideDest + ') unavailable or unreadable. ' +
                'Please check this path in config.');
            atlasConfig.isCorrupted = true;
            return;
        }

        if (!config.cssSrc) {
            printMessage('error', '"cssSrc" not defined. This config is required.');
            atlasConfig.isCorrupted = true;
            return;
        }

        if (!fs.existsSync(path.join(projectRoot, config.cssSrc))) {
            printMessage('error', '"cssSrc" directory (' + config.cssSrc + ') in config unavailable or ' +
                'unreadable. Please check this path in config.');
            atlasConfig.isCorrupted = true;
            return;
        }

        // Mandatory configs
        atlasConfig.guideSrc = path.join(projectRoot, config.guideSrc, '/');
        atlasConfig.guideDest = path.join(projectRoot, config.guideDest, '/');
        atlasConfig.cssSrc = path.join(projectRoot, config.cssSrc);

        // Optional configs
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
        const scssAdditionalImports = config.scssAdditionalImportsArray;
        const copyInternalAssets = config.copyInternalAssets;

        atlasConfig.scssAdditionalImportsArray =
            scssAdditionalImports ? path.join(projectRoot, scssAdditionalImports) : [];

        atlasConfig.excludedDirs = new RegExp(config.excludedDirs || '.^', 'g');
        atlasConfig.excludedCssFiles = new RegExp(config.excludedCssFiles || '.^', 'g');
        atlasConfig.excludedSassFiles = new RegExp(config.excludedSassFiles || '.^', 'g');

        atlasConfig.copyInternalAssets = copyInternalAssets !== undefined ? copyInternalAssets : true;
        atlasConfig.internalAssetsPath = path.join(__dirname, '../assets');

        atlasConfig.componentPrefixes = getComponentsPrefix(config);
    }

    function getTemplates() {
        if (atlasConfig.isCorrupted) {
            return;
        }

        const templatesConfig = config.templates;
        const internalTemplatesPath = '../views/templates/';
        let templates = {
            'component': '',
            'guide': '',
            'about': '',
            'insights': '',
            'bundle': ''
        };

        for (let template in templates) {
            if (!templates.hasOwnProperty(template)) {
                continue;
            }
            if (templatesConfig !== undefined && templatesConfig.hasOwnProperty(template)) {
                if (fs.existsSync(path.join(projectRoot, templatesConfig[template]))) {
                    templates[template] = path.join(projectRoot, templatesConfig[template]);
                    continue;
                } else {
                    printMessage('warn', '"' + template + '" template is declared, but file not found. ' +
                        'Internal partial used for this include.');
                }
            }
            templates[template] = path.join(__dirname, internalTemplatesPath, template + '.mustache');
        }

        return atlasConfig.templates = templates;
    }

    function getAdditionalPages() {
        if (atlasConfig.isCorrupted) {
            return;
        }

        atlasConfig.additionalPages = [];

        if (fs.existsSync(path.join(projectRoot, 'README.md'))) {
            atlasConfig.additionalPages.push({
                'id': 'index',
                'title': 'about',
                'src': path.join(projectRoot, 'README.md'),
                'target': path.join(atlasConfig.guideDest, '/index.html'),
                'template': atlasConfig.templates.about,
                'type': 'about',
                'subPages': []
            });
        }
    }

    getBase();
    getTemplates();
    getAdditionalPages();

    return atlasConfig;
}

function getPartialsConfig(configRaw) {
    let atlasConfig = {
        'isCorrupted': false
    };
    const config = getConfig(configRaw);

    function getPartials() {
        if (atlasConfig.isCorrupted) {
            return;
        }

        const partialsConfig = config.partials;
        const internalPartialsPath = '../views/includes/partials/';
        let partials = {
            'aside': '',
            'assetsfooter': '',
            'assetshead': '',
            'componentstataside': '',
            'componentstatfooter': '',
            'componentstructure': '',
            'copyright': '',
            'footer': '',
            'header': '',
            'logo': '',
            'navigation': '',
            'toc': '',
            'welcome': ''
        };

        for (let partial in partials) {
            if (!partials.hasOwnProperty(partial)) {
                continue;
            }
            if (partialsConfig !== undefined && partialsConfig.hasOwnProperty(partial)) {
                if (fs.existsSync(path.join(projectRoot, partialsConfig[partial]))) {
                    partials[partial] = path.join(projectRoot, partialsConfig[partial]);
                    continue;
                } else {
                    printMessage('warn', '"' + partial + '" template is declared, but file not found. ' +
                        'Internal partial used for this include.');
                }
            }
            partials[partial] = path.join(__dirname, internalPartialsPath, partial + '.mustache');
        }

        return atlasConfig.partials = partials;
    }

    getPartials();

    return atlasConfig;
}

function getDeclaredConstants(configRaw) {
    let atlasConfig = {
        'isCorrupted': false
    };
    const config = getConfig(configRaw);

    function getConstants() {
        if (atlasConfig.isCorrupted) {
            return;
        }
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
            'isDefined': true
        };

        if (config.projectConstants !== undefined) {
            const constantsSrc = path.join(projectRoot, config.projectConstants.constantsSrc);
            // check if constantsSrc exist
            if (fs.existsSync(constantsSrc)) {
                projectConstants.constantsSrc = constantsSrc;
            } else {
                printMessage('warn', '"projectConstants" is declared, but constants file not found. ' +
                    'Could not continue.');
                projectConstants.isDefined = false;
            }
        } else {
            projectConstants.isDefined = false;
            return;
        }

        if (!projectConstants.isDefined) {
            return atlasConfig.projectConstants = projectConstants;
        }

        projectConstants.constantsList = [];

        constantsList.forEach(constant => {
            if (constant === undefined) {
                return;
            }
            projectConstants.constantsList.push({
                'name': constant.replace(/Prefix/g, ''),
                'regex': new RegExp('^\\$' + config.projectConstants[constant])
            });
        });

        atlasConfig.projectConstants = projectConstants;
    }

    getConstants();

    return atlasConfig;
}

function getProjectInfo(configRaw) {
    let atlasConfig = {
        'isCorrupted': false
    };
    const config = getConfig(configRaw);

    function getProjectInfo() {
        const pkg = require(path.join(projectRoot, 'package.json'));
        let projectName = 'atlas';

        if (config.projectInfo !== undefined) {
            if (config.projectInfo.name) {
                projectName = config.projectInfo.name;
            }
        } else {
            if (!pkg.name) {
                printMessage('warn', 'Neither "projectName" in atlas, nor "name" in package.json is declared. ' +
                    '"atlas" name used instead.');
            } else {
                projectName = pkg.name;
            }
        }

        return atlasConfig.projectInfo = {
            'name': projectName,
            'version': pkg.version || ''
        };
    }

    getProjectInfo();

    return atlasConfig;
}

module.exports = {
    'getProjectInfo': getProjectInfo,
    'getBase': getBaseConfig,
    'getPartials': getPartialsConfig,
    'getConstants': getDeclaredConstants
};
