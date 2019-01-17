'use strict';

const path = require('path');
const fs = require('fs');

// Prepare config and basic models
const atlasConfig = require(path.resolve(__dirname, '../models/atlasconfig.js'));
const atlasBase = atlasConfig.getBase();
if (atlasBase.isCorrupted) {
    module.exports = {
        'build': () => new Promise(resolve => resolve('Config is corrupted')),
        'buildAll': () => new Promise(resolve => resolve('Config is corrupted'))
    };
    return;
}

// Models
const projectTree = require(path.resolve(__dirname, '../models/projectdocumentedtree.js'))(atlasBase);
const projectImports = require(path.resolve(__dirname, '../models/projectimportsgraph.js'));
const projectImportsGraph = projectImports.getImportsGraph(atlasBase);
const projectConstants = require(path.resolve(__dirname, '../models/projectconstants.js'))(atlasBase.constants,
    atlasBase.scssAdditionalImportsArray, atlasBase.constants.constantsFile);
const projectInfo = atlasConfig.getProjectInfo();
const componentImports = src => projectImports.getFileImports(src, projectImportsGraph);
const componentStat = require(path.resolve(__dirname, '../models/componentstat.js'));
const renderedPageContent = require(path.resolve(__dirname, '../models/pagecontent.js'));

// View models
const statistics = require(path.resolve(__dirname, '../viewmodels/statcomponent.js'));
const coverage = require(path.resolve(__dirname, '../viewmodels/coverage.js'));
const styleguide = require(path.resolve(__dirname, '../viewmodels/styleguide.js'));

// Utils
const normalizePath = require('./utils/normalizepath');
const writePage = require('./utils/writepage');

// Copy internal assets to the components destinations
if (atlasBase.copyInternalAssets) {
    const guideDest = atlasBase.guideDest;
    const assetsSrc = atlasBase.internalAssetsPath;
    const copyInternalAssets = require(path.join(__dirname, '/utils/copyassets.js'));
    copyInternalAssets(assetsSrc, guideDest);
}

// Cache basic templates
const cachedTemplates = {
    'component': fs.readFileSync(atlasBase.templates.component, 'utf8'),
    'guide': fs.readFileSync(atlasBase.templates.guide, 'utf8')
};

function getCachedTemplates(type, path) {
    switch (type) {
        case 'guide':
            return cachedTemplates.guide;
        case 'component':
        case 'container':
            return cachedTemplates.component;
        default:
            return fs.readFileSync(path, 'utf8');
    }
}

// Prepare content model depending on component type
function prepareContentModel(component) {
    let content;
    let tableOfContent;
    let stat;
    let page;
    let isNeedStat;

    if (component.src !== '') { // could be stat pages or custom defined file
        page = renderedPageContent(component.src, {'title': component.title});
        content = page.content;
        tableOfContent = page.toc;
        isNeedStat = page.isNeedStat;
    }
    switch (component.type) {
        case 'styleguide':
            content = styleguide(projectConstants);
            break;
        case 'component':
        case 'container':
            if (isNeedStat) {
                stat = statistics(
                    componentStat.getStatFor(component.src, atlasBase.componentPrefixes),
                    componentImports(component.src),
                    projectConstants
                );
            }
            break;
        case 'about':
            stat = {
                'projectName': atlasConfig.getProjectInfo().name,
                'coverage': coverage(projectTree.coverage)
            };
            break;
    }

    return {
        documentation: content,
        toc: tableOfContent,
        componentStats: stat
    };
}

let cachedContent = {};
const isContentChanged = (url, content) => {
    if (url === undefined) {
        return true;
    }
    if (content !== cachedContent[url]) {
        cachedContent[url] = content;
        return true;
    } else {
        return false;
    }
};

/**
 * Walk though documented files in project and generate particular page (if path specified) or full docset if no path
 * provided.
 * @public
 * @param {string} [url] - path to file. If no string provided or function is passed this build all components
 * @return {Promise<string>}
 */
function makeComponent(url) {
    const source = normalizePath(url);
    let docSet = [];

    function traverseDocumentedTree(components, sourcePath) {
        components.forEach(component => {
            const isMakeAllComponents = sourcePath === undefined;
            const isFileInConfig = isMakeAllComponents ? true : sourcePath === component.src;
            const isFile = component.target;

            if (isFile && isFileInConfig) {
                const content = prepareContentModel(component);
                if (isContentChanged(sourcePath, content.documentation)) {
                    docSet.push({
                        title: component.title,
                        target: component.target,
                        templateString: getCachedTemplates(component.type, component.template),
                        type: component.type,
                        isDeprecated: component.isDeprecated,
                        content: content,
                        subPages: projectTree.subPages
                    });
                }

                if (!isMakeAllComponents) {
                    return;
                }
            }

            if (component.subPages.length) {
                traverseDocumentedTree(component.subPages, sourcePath);
            }
        });
    }
    traverseDocumentedTree(projectTree.subPages, source);

    return Promise.all(docSet.map(writePage));
}

module.exports = {
    'build': makeComponent,
    'buildAll': function() {
        return Promise.all([
            makeComponent(),
            require('./buildreports.js')(atlasBase, projectTree, projectImportsGraph, projectInfo)
        ]);
    }
};
