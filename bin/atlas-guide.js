#!/usr/bin/env node
'use strict';

const arg = process.argv[2];

try {
    switch (arg) {
        case '--build':
            require('../app/atlas-guide').buildAll();
            break;
        case '--version':
        case '-v':
            console.log('atlas-guide ' + require('../package').version);
            break;
        case '--help':
        default:
            console.log(`Usage: atlas-guide [option]

Options:            
  --build                    build all atlas pages
  -v, --version              print Atlas-guide version
  --help                     print this message`);
    }
} catch (e) {
    if (e.code === 'ENOENT') {
        console.error('Error: no such file or directory "' + e.path + '"');
    } else {
        console.error('Error: ' + e.message);
    }

    // console.log(e.stack);
    process.exit(1);
}
