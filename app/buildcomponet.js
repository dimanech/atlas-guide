'use strict';

const path = require('path');

module.exports = function(atlasConfig, projectTree, projectImportsGraph, projectImports, writePage) {
    const projectConstants = require(path.resolve(__dirname, '../models/projectconstants.js'))(atlasConfig.constants,
        atlasConfig.scssAdditionalImportsArray, atlasConfig.constants.constantsFile);
    const componentImports = src => projectImports.getFileImports(src, projectImportsGraph);
    const componentStat = require(path.resolve(__dirname, '../models/componentstat.js'));
    const renderedPageContent = require(path.resolve(__dirname, '../models/pagecontent.js'));

    // View models
    const statistics = require(path.resolve(__dirname, '../viewmodels/statcomponent.js'));
    const coverage = require(path.resolve(__dirname, '../viewmodels/coverage.js'));
    const styleguide = require(path.resolve(__dirname, '../viewmodels/styleguide.js'));

    // Utils
    const normalizePath = require('./utils/normalizepath');

    // Prepare content model depending on component type
    function prepareContentModel(component) {
        let content;
        let tableOfContent;
        let stat;
        let page;
        let isNeedStat;

        if (component.src !== '') { // could be stat pages or custom defined file
            page = renderedPageContent(component.src, { 'title': component.title });
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
                        componentStat.getStatFor(component.src, atlasConfig.componentPrefixes),
                        componentImports(component.src),
                        projectConstants
                    );
                }
                break;
            case 'about':
                stat = {
                    'projectName': atlasConfig.projectInfo.name,
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
     * Walk though documented files in project and generate particular page (if path specified)
     * or full docset if no path provided.
     * @public
     * @param {string} [url] - path to file. If no string provided or function is passed this build all components
     * @return {Promise<string>}
     */
    function buildComponent(url) {
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
                            id: component.id,
                            title: component.title,
                            target: component.target,
                            template: component.type,
                            type: component.type,
                            isDeprecated: component.isDeprecated,
                            content: content
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

    return { buildComponent };
};
