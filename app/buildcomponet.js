'use strict';

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

module.exports = function(atlasConfig, projectTree, projectImportsGraph, projectImports, writePage) {
    // Utils
    const normalizePath = require('./utils/normalizepath');
    const prepareContent = require('./utils/preparecontent')(
        atlasConfig, projectTree, projectImportsGraph, projectImports).prepareContent;

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
                    const content = prepareContent(component);
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
