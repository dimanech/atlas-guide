#!/usr/bin/env node
'use strict';

const arg = process.argv[2];

try {
    switch (arg) {
        case '--build':
        case '-b':
            require('../app/atlas-guide').withConfig(process.argv[3]).buildAll();
            break;
        case '--version':
        case '-v':
            console.log('atlas-guide ' + require('../package').version);
            break;
        case '--help':
        default:
            console.log(`
Usage: atlas-guide [option ?config]

Options:            
  -b, --build                build all atlas pages, followed with config '--build ./path/to/conf.json'
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
