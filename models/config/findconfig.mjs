import fs, { readFileSync } from 'node:fs';
import path from 'node:path';
import printMessage from '../utils/printmessage.mjs';
const projectRoot = process.cwd();

/**
 * @param {string|Object} config
 */
function findConfig(config) {
    if (config !== undefined) {
        if (typeof config === 'object') {
            return config;
        }
        const configPath = path.join(projectRoot, config);
        if (fs.existsSync(configPath)) {
            const rawContent = readFileSync(configPath, { encoding: 'utf8' });
            return JSON.parse(rawContent);
        }
    }

    printMessage('error', 'Could not find Atlas configuration. Please pass path to config ' +
        'or raw config object into atlas.withConfig()');

    return undefined;
}

export default findConfig;
