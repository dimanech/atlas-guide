'use strict';

const path = require('path');
const fs = require('fs');

// Get basic models
const atlasConfig = require(path.resolve(__dirname, '../models/atlasconfig.js'));
const atlasBase = atlasConfig.getBase();
if (atlasBase.isCorrupted) {
    module.exports = {
        'build': () => {},
        'buildAll': () => {}
    };
    return;
}

const projectTree = require(path.resolve(__dirname, '../models/projectdocumentedtree.js'))(atlasBase);
const deps = require(path.resolve(__dirname, '../models/projectimportsgraph.js'));
const importsGraph = deps.getImportsGraph(atlasConfig);
const componentImports = (src) => deps.getFileImports(src, importsGraph);
const componentStat = require(path.resolve(__dirname, '../models/componentstat.js'));

const statistics = require(path.join(__dirname, '../viewmodels/statcomponent.js'));
const pageContent = require(path.join(__dirname, '../viewmodels/pagecontent.js'));
const writePage = require(__dirname + '/utils/renderpage.js');

// Copy internal assets to the components destinations
if (atlasBase.copyInternalAssets) {
    const guideDest = atlasBase.guideDest;
    const assetsSrc = atlasBase.internalAssetsPath;
    const copyInternalAssets = require(__dirname + '/utils/copyassets.js');
    copyInternalAssets(assetsSrc, guideDest);
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
    if (type === 'component' || type === 'layout') {
        return cachedTemplates.component;
    }
    return fs.readFileSync(path, 'utf8');
}

/**
 * Walk though documented files in project and generate particular page (if path specified) or full docset if no string
 * provided.
 * @public
 * @param url {string} - path to file. If no string provided or function is passed this build all components
 * @param callback {function} - callback function
 */
function makeComponent(url, callback) {
    function traverseDocumentedTree(components, targetPath) {
        components.forEach(component => {
            const makeAllComponents = targetPath === undefined || typeof targetPath === 'function';
            const isFileInConfig = makeAllComponents ? true : targetPath === component.src;
            const isFile = component.target;

            if (isFile && isFileInConfig) {
                const content = pageContent(component.src, {'title': component.title});
                let stat;
                if (component.type === 'component' || component.type === 'layout') {
                    stat = statistics(componentStat.getStatFor(component.src), componentImports(component.src));
                }
                writePage({
                    title: component.title,
                    target: component.target,
                    templateString: getCachedTemplates(component.type, component.template),
                    type: component.type,
                    content: {
                        documentation: content.content,
                        toc: content.toc,
                        componentStats: stat
                    },
                    subPages: projectTree.subPages
                }, callback);
                if (!makeAllComponents) {
                    return;
                }
            }

            if (component.subPages.length) {
                traverseDocumentedTree(component.subPages, targetPath);
            }
        });
    }

    traverseDocumentedTree(projectTree.subPages, url);
}

module.exports = {
    'build': makeComponent,
    'buildAll': function() {
        makeComponent();
        // this heavy statistic models not needed for common dev flow
        require('./buildreports.js')(atlasConfig, projectTree, importsGraph);
    }
};
