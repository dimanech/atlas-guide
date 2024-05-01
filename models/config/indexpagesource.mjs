import fs from 'node:fs';
import path from 'node:path';
import printMessage from '../utils/printmessage.mjs';

function getIndexPageSource(projectRoot, guideSrc, indexPageSource) {
    const inConfig = indexPageSource ? path.join(projectRoot, indexPageSource) : '';
    const inGuide = path.join(guideSrc, 'README.md');
    const inProject = path.join(projectRoot, 'README.md');
    let indexSrc;

    if (indexPageSource !== undefined && !fs.existsSync(inConfig)) {
        printMessage('warn', '"indexPageSource" is defined, but resource is unavailable or unreadable. ' +
            'Please check this path in config. Fallback to README.md');
    }

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

export default getIndexPageSource;
