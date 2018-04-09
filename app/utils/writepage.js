'use strict';

const fs = require('fs');
const mustache = require('mustache');
const view = require('./prepareview');

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
                view.prepareView(config),
                view.partials
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
