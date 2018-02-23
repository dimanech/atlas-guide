#!/usr/bin/env node
'use strict';

const path = require('path');
const { exec, execSync } = require('child_process');
const nodeBin = path.resolve(path.join(process.cwd(), 'node_modules', '.bin'));
const files = execSync('git diff --cached --name-only --diff-filter=ACMR -- **/*.js | xargs echo').toString().trim();
const errorMsg = "[GUARD]: Some js files are invalid. Please fix errors and try committing again";

if (files) {
    exec(path.join(nodeBin, 'eslint --quiet') + ' ' + files, (error, stdout, stderr) => {
        if (stdout) {
            console.error(errorMsg);
            console.error(stdout);
            process.exit(1);
        }
        process.exit(0);
    });
}
