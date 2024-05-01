#!/usr/bin/env node
'use strict';

const parseOption = arg => arg.split(/=/);
const arg = parseOption(process.argv[2]);
import atlasGuide from '../app/atlas-guide.mjs';

function getJSON(filePath) {
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
}

try {
    switch (arg[0]) {
        case '--build':
        case '-b':
            atlasGuide(arg[1]).buildAll();
            break;
        case '--version':
        case '-v':
            console.log('atlas-guide ' + getJSON('../package').version);
            break;
        case '--help':
        default:
            console.log(`
Usage: atlas-guide [OPTION]

Options:
  -b, --build=FILE           build all atlas pages, followed with config '--build=./path/to/config.json'
  -v, --version              print Atlas-guide version
  --help                     print this message
            `);
    }
} catch (e) {
    if (e.code === 'ENOENT') {
        console.error('Error: no such file or directory "' + e.path + '"');
    } else {
        console.error('Error: ' + e.message);
    }
    process.exit(1);
}
