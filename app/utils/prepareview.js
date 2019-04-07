'use strict';

module.exports = function init(projectInfo, subPages) {
    const inline = require('./templateHelpers/inline.js');
    const pluralize = require('./templateHelpers/pluralize.js');

    const View = function(config) {
        this.projectInfo = {
            name: projectInfo.name,
            version: projectInfo.version
        };
        this.title = config.title;
        this.content = config.content;
        this.type = config.type;
        this.isDeprecated = config.isDeprecated;
        this.subPages = subPages.subPages; // Pages tree
    };

    View.prototype.inline = () => (text, render) => inline(text, render);
    View.prototype.pluralize = () => (text, render) => pluralize(text, render);

    return { view: config => new View(config) };
};
