'use strict';

const fs = require('fs');
const path = require('path');
const mustache = require('mustache');

const atlasConfig = require(path.join(__dirname, '../../models/atlasconfig.js'));
const projectInfo = atlasConfig.getProjectInfo();
const partials = atlasConfig.getPartials();

const inline = require('./templateHelpers/inline');
const pluralize = require('./templateHelpers/pluralize');

const View = function(page) {
    this.projectInfo = { // could be cached
        'name': projectInfo.name,
        'version': projectInfo.version
    };
    this.pageTitle = page.title;
    this.content = page.content;
    this.type = page.type;
    this.subPages = page.subPages; // could be cached
};

View.prototype.inline = () => (text, render) => inline(text, render);
View.prototype.pluralize = () => (text, render) => pluralize(text, render);

function prepareView(config) {
    return new View({
        title: config.title,
        content: config.content,
        type: config.type,
        subPages: config.subPages
    });
}

/**
 * Prepare data and write file to destination.
 * @private
 * @param {object} config - config object with templates and data
 * @return {Promise<string>}
 */
function writeGuidePage(config) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(
            config.target,
            mustache.render(
                config.templateString,
                prepareView(config),
                partials
            ),
            error => {
                if (error) {
                    reject(error); // cover me
                } else {
                    resolve('Page saved');
                }
            }
        );
    });
}

module.exports = writeGuidePage;
