'use strict';

const path = require('path');
const fs = require('fs');
const cwd = process.cwd();

// Get basic models
const atlasConfig = require(path.resolve(__dirname, '../models/atlasconfig.js'));
const atlasBase = atlasConfig.getBase();
if (atlasBase.isCorrupted) {
    module.exports = {
        'build': () => {},
        'buildAll': () => {}
    };
}

// Models
const projectTree = require(path.resolve(__dirname, '../models/projectdocumentedtree.js'))(atlasBase);
const projectImports = require(path.resolve(__dirname, '../models/projectimportsgraph.js'));
const projectImportsGraph = projectImports.getImportsGraph(atlasBase);
const componentImports = src => projectImports.getFileImports(src, projectImportsGraph);
const componentStat = require(path.resolve(__dirname, '../models/componentstat.js'));
const constants = require(path.resolve(__dirname, '../models/projectconstants.js'))(atlasBase.constants,
    atlasBase.scssAdditionalImportsArray, atlasBase.constants.constantsFile);
const pageContent = require(path.resolve(__dirname, '../models/pagecontent.js'));

// View models
const statistics = require(path.resolve(__dirname, '../viewmodels/statcomponent.js'));
const coverage = require(path.resolve(__dirname, '../viewmodels/coverage.js'));
const styleguide = require(path.resolve(__dirname, '../viewmodels/styleguide.js'));

// Utils
const writePage = require(path.join(__dirname, '/utils/writepage.js'));

// Copy internal assets to the components destinations
if (atlasBase.copyInternalAssets) {
    const guideDest = atlasBase.guideDest;
    const assetsSrc = atlasBase.internalAssetsPath;
    const copyInternalAssets = require(path.join(__dirname, '/utils/copyassets.js'));
    copyInternalAssets(assetsSrc, guideDest);
}

// Normalize path
function normalizePath(url) {
    if (url !== undefined) {
        return path.isAbsolute(url) ? url : path.join(cwd, url);
    } else {
        return url;
    }
}

// Cache basic templates
const cachedTemplates = {
    'component': fs.readFileSync(atlasBase.templates.component, 'utf8'),
    'guide': fs.readFileSync(atlasBase.templates.guide, 'utf8')
};

function getCachedTemplates(type, path) {
    if (type === 'guide') {
        return cachedTemplates.guide;
    }
    if (type === 'component' || type === 'container') {
        return cachedTemplates.component;
    }
    return fs.readFileSync(path, 'utf8');
}

// Prepare content
function prepareContent(component) {
    let content;
    let tableOfContent;
    let stat;
    let page;

    if (component.src !== '') { // could be stat pages or custom defined file
        page = pageContent(component.src, {'title': component.title});
        content = page.content;
        tableOfContent = page.toc;
    }
    switch (component.type) {
        case 'styleguide':
            content = styleguide(constants);
            break;
        case 'component':
        case 'container':
            if (page.isNeedStat) {
                stat = statistics(
                    componentStat.getStatFor(component.src, atlasBase.componentPrefixes),
                    componentImports(component.src),
                    constants
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
                docSet.push({
                    title: component.title,
                    target: component.target,
                    templateString: getCachedTemplates(component.type, component.template),
                    type: component.type,
                    isDeprecated: component.isDeprecated,
                    content: prepareContent(component),
                    subPages: projectTree.subPages
                });

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
            require('./buildreports.js')(atlasConfig, projectTree, projectImportsGraph)
        ]);
    }
};
