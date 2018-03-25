#!/usr/bin/env node
'use strict';

const { exec } = require('child_process');
const command = 'npm test';

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(stdout);
        console.log('[GUARD]: Tests not passed');
        process.exit(1);
    }
    process.exit(0);
});
