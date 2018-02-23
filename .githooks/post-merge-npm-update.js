#!/usr/bin/env node
'use strict';

const { exec } = require('child_process');
const command = 'git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | xargs echo | grep --quiet "package.json" && npm install --silent --no-package-lock';

exec(command, (error, stdout, stderr) => {
    if (stderr) {
        console.error(stderr);
        process.exit(1);
    }
    process.exit(0);
});
