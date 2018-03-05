'use strict';

const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} atlasComponentObject
 * @property {string} title - title of resource [category|component|guide]
 * @property {string} type - type of resource [category|guide|component|layout]
 * @property {string} [src] - source file of resource
 * @property {string} [target] - path to generated component html
 * @property {string} [template] - template type that used for html
 * @property {array} subPages - list of contained resources
 */
/**
 * Subtract documented components tree from project tree.
 * This will be used as data for pages generation and as high availability project map to prevent unnecessary direct
 * work with FS.
 * @private
 * @param {object} atlasConfig
 * @return {atlasComponentObject} tree of nodes
 */
function makeProjectTree(atlasConfig) {
    let docSet = {
        'title': '',
        'coverage': {
            'all': 0,
            'covered': 0
        },
        'subPages': []
    };
    function isExcludedFile(name) {
        return atlasConfig.excludedSassFiles.test(name);
    }
    function isExcludedDirectory(name) {
        return atlasConfig.excludedDirs.test(name);
    }
    function isDocumented(filePath) {
        const file = fs.readFileSync(filePath, 'utf8');
        const docComment = /\/\*md(\r\n|\n)(((\r\n|\n)|.)*?)\*\//g;

        return docComment.exec(file);
    }

    /**
     * Traverse directories and generate components config
     * @param {string} url - components source
     * @param {object} config - base for generated config
     * @param {string} categoryName - category name that will be used as component prefix. 'atlas' as start point,
     * directory name in all future cases.
     */
    function findComponents(url, config, categoryName) {
        const dir = fs.readdirSync(url);

        dir.forEach(res => {
            let name = res;
            let target = path.join(url, name);
            let resource = fs.statSync(target);

            if (resource.isFile()) {
                if (path.extname(name) === '.scss') {
                    docSet.coverage.all++;
                }
                if (path.extname(name) === '.scss' && isDocumented(target) && !isExcludedFile(name)) {
                    docSet.coverage.covered++;
                    const id = categoryName + '_' + path.basename(name, '.scss');
                    const title = path.basename(name, '.scss').replace(/_/i, '');
                    config.push({
                        id: id,
                        title: title,
                        type: /^l-/i.test(title) ? 'layout' : 'component',
                        src: target,
                        target: atlasConfig.guideDest + id + '.html',
                        template: atlasConfig.templates.component,
                        subPages: []
                    });
                }
                if (path.extname(name) === '.md') {
                    const id = categoryName + '-' + path.basename(name, '.md');
                    config.push({
                        id: id,
                        type: 'guide',
                        title: path.basename(name, '.md'),
                        src: target,
                        target: atlasConfig.guideDest + id + '.html',
                        template: atlasConfig.templates.docs,
                        subPages: []
                    });
                }
            } else if (resource.isDirectory() && !isExcludedDirectory(name)) {
                config.push({
                    title: name,
                    type: 'category',
                    subPages: []
                });
                findComponents(
                    target,
                    config[config.length - 1].subPages,
                    name
                );
            }
        });
    }
    findComponents(
        atlasConfig.guideSrc,
        docSet.subPages,
        'atlas'
    );

    if (atlasConfig.additionalPages.subPages !== undefined && atlasConfig.additionalPages.subPages.length) {
        atlasConfig.additionalPages.subPages.forEach(item => docSet.subPages.push(item));
    }

    return docSet;
}

module.exports = makeProjectTree;
