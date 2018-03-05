'use strict';

const fs = require('fs');
const path = require('path');
const mustache = require('mustache');

const atlasConfig = require(path.join(__dirname, '../../models/atlasconfig.js'));
const projectInfo = atlasConfig.getProjectInfo().projectInfo;

function getPartials() {
    const partialsMap = atlasConfig.getPartials().partials;
    let partials = {};

    Object.keys(partialsMap).forEach(partial => partials[partial] = fs.readFileSync(partialsMap[partial], 'utf8'));

    return partials;
}
const partials = getPartials();

const View = function(page) {
    this.projectInfo = {
        'name': projectInfo.name,
        'version': projectInfo.version
    };
    this.pageTitle = page.title;
    this.content = page.content;
    this.subPages = page.subPages;
    this.type = page.type;
};

View.prototype.inline = () => {
    return function(text, render) {
        return fs.readFileSync(path.resolve(process.cwd(), render(text)), 'utf8');
    };
};

View.prototype.pluralize = () => {
    return function(text, render) {
        const args = render(text).split(',');
        const singular = args[1];
        const plural = args[2];
        return parseFloat(args[0]) === 1 ? singular : plural;
    };
};

function prepareView(config) {
    return new View({
        title: config.title,
        content: config.content,
        subPages: config.subPages,
        type: config.type
    });
}

/**
 * Prepare data and write file to the destination.
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
                    reject(error);
                } else {
                    resolve('Page saved');
                }
            }
        );
    });
}

module.exports = writeGuidePage;
