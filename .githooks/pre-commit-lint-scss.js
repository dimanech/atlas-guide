#!/usr/bin/env node
'use strict';

//
// Lint changed files using stylelint
// For validating prefixed (_re-) sass files use "git diff --cached --name-only --diff-filter=ACMR -- _re-*.scss **/_re-*.scss")
//

const path = require('path');
const { exec, execSync } = require('child_process');
const nodeBin = path.resolve(path.join(process.cwd(), 'node_modules', '.bin'));
const files = execSync('git diff --cached --name-only --diff-filter=ACMR -- *.scss **/*.scss | xargs echo').toString().trim();
const errorMsg = "[GUARD]: Some scss files are invalid. Please fix errors and try committing again";

if (files) {
    exec(path.join(nodeBin, 'stylelint') + ' ' + files, (error, stdout, stderr) => {
        console.log('[GUARD]: Lint SCSS...');
        if (stdout) {
            console.error(errorMsg);
            console.error(stdout);
            process.exit(1);
        }
        process.exit(0);
    });
}
