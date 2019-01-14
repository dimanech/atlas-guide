'use strict';

const fillTemplatesConfig = require('./utils').fillTemplatesConfig;

function getTemplates(config) {
    return fillTemplatesConfig(config.templates, '../../views/templates/', 'template');
}

module.exports = getTemplates;
