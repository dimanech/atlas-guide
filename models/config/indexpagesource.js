'use strict';

const fs = require('fs');
const path = require('path');

function getIndexPageSource(projectRoot, guideSrc, indexPageSource) {
    const inConfig = path.join(projectRoot, indexPageSource);
    const inGuide = path.join(guideSrc, 'README.md');
    const inProject = path.join(projectRoot, 'README.md');
    let indexSrc;

    switch (true) {
        case fs.existsSync(inConfig):
            indexSrc = inConfig;
            break;
        case fs.existsSync(inGuide):
            indexSrc = inGuide;
            break;
        case fs.existsSync(inProject):
            indexSrc = inProject;
            break;
        default:
            indexSrc = '';
    }

    return indexSrc;
}

module.exports = getIndexPageSource;
