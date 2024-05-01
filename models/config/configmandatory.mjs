import fs from 'node:fs';
import path from 'node:path';
import printMessage from '../utils/printmessage.mjs';
const projectRoot = process.cwd();
const absPath = relPath => path.join(projectRoot, relPath, '/');

const isPathReachable = (destination, name) => {
    if (!destination) {
        printMessage('error', '"' + name + '" not defined. This field is mandatory');
        return false;
    } else if (!fs.existsSync(absPath(destination))) {
        printMessage('error', '"' + name + '" (' + destination + ') in config unavailable or unreadable. ' +
            'Please check this path in config');
        return false;
    } else {
        return true;
    }
};

function getMandatoryBaseConfig(config) {
    if (!isPathReachable(config.guideSrc, 'guideSrc') ||
        !isPathReachable(config.cssSrc, 'cssSrc')) {
        return { isCorrupted: true }; // return with corrupted config if we don't have critical info
    }
    let atlasConfig = {};

    // Process mandatory configs
    atlasConfig.guideSrc = absPath(config.guideSrc);
    atlasConfig.cssSrc = absPath(config.cssSrc);

    // Check if scssSrc defined as alternative for documentation root
    if (config.scssSrc === undefined) {
        atlasConfig.scssSrc = atlasConfig.guideSrc;
    } else {
        const scssSrc = absPath(config.scssSrc);
        if (!fs.existsSync(scssSrc)) {
            atlasConfig.scssSrc = atlasConfig.guideSrc;
            printMessage('warn', '"scssSrc" is defined, but directory (' + config.scssSrc + ') unavailable or ' +
                'unreadable. "cssSrc" directory used as fallback');
        } else {
            atlasConfig.scssSrc = scssSrc;
        }
    }

    // Check and create destination directory if needed
    const createDestination = config.createDestFolder || false;
    if (!config.guideDest) {
        printMessage('error', '"guideDest" not defined. This field is mandatory');
        return { isCorrupted: true };
    }
    if (!fs.existsSync(absPath(config.guideDest))) {
        if (createDestination) {
            fs.mkdirSync(path.join(projectRoot, config.guideDest));
            printMessage('warn', '"guideDest": ' + config.guideDest + ' directory created');
        } else {
            printMessage('error', '"guideDest" (' + config.guideDest + ') in config unavailable or unreadable. ' +
                'Please check this path in config');
            return { isCorrupted: true };
        }
    }
    atlasConfig.guideDest = absPath(config.guideDest);

    return atlasConfig;
}

export default getMandatoryBaseConfig;
