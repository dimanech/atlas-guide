#!/usr/bin/env node
'use strict';

const { exec } = require('child_process');
const command = 'npm test';

exec(command, (error, stdout, stderr) => {
    if (stderr) {
        console.error(stderr);
        process.exit(1);
    }
    process.exit(0);
});
