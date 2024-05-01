import fs, { readFileSync } from 'node:fs';
import path, { dirname } from 'node:path';

import printMessage from './utils/printmessage.mjs';
import getConfig from './config/findconfig.mjs';
import getOptionalBaseConfigs from './config/configoptional.mjs';
import getIndexPageSource from './config/indexpagesource.mjs';
import getAdditionalPages from './config/additionalpages.mjs';
import getMandatoryBaseConfig from './config/configmandatory.mjs';
import getDeclaredConstants from './config/constants.mjs';

import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = process.cwd();

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
                printMessage('warn', `"${template} ${name}" is declared, but file not found. 'Internal partial used for this include.`);
            }
        }
        templates[template] = path.join(__dirname, internalTemplatesPath, `${template}.mustache`);
    });

    return templates;
};

function getPackageJSON() {
    const packageJSONPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(packageJSONPath)) {
        const rawContent = readFileSync(packageJSONPath, { encoding: 'utf8' });
        return JSON.parse(rawContent);
    }
    return null;
}

const getProjectInfo = config => {
    const pkg = getPackageJSON();
    let projectName = 'atlas';

    if (config.projectInfo !== undefined && config.projectInfo.name) {
        projectName = config.projectInfo.name;
    } else {
        if (!pkg.name) {
            printMessage('warn', 'Neither "projectName" in atlas, nor "name" in package.json is declared. "atlas" name used instead.');
        } else {
            projectName = pkg.name.replace('/', '-'); // fix namespaced project names
        }
    }

    return {
        name: projectName,
        version: pkg.version || ''
    };
}

const getBaseConfig = configRaw => {
    const config = getConfig(configRaw);
    if (config === undefined) {
        return { isCorrupted: true };
    }
    const baseMandatory = getMandatoryBaseConfig(config);
    if (baseMandatory.isCorrupted) {
        return { isCorrupted: true };
    }

    const baseOptional = getOptionalBaseConfigs(config);

    const templates = { templates: fillTemplatesConfig(config.templates, '../views/templates/', 'template') };

    const constants = { constants: getDeclaredConstants(config) };

    const additionalPages = {
        additionalPages: getAdditionalPages(
            templates.templates,
            baseMandatory.guideDest,
            constants.constants,
            getIndexPageSource(projectRoot, baseMandatory.guideSrc, baseOptional.indexPageSource)
        )
    };

    const partials = { partials: fillTemplatesConfig(config.partials, '../views/includes/partials/', 'partial') };

    const projectInfo = { projectInfo: getProjectInfo(config) };

    return {...baseMandatory, ...baseOptional, ...templates, ...additionalPages, ...constants, ...partials, ...projectInfo };
}

export default getBaseConfig;
