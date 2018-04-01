#!/usr/bin/env node
'use strict';

const fs = require('fs');

const commitRegExp = new RegExp('^(ADD|RM|UP|FIX|WIP): (.*)|^(Merge|Revert|Finish).+');
const errorMsg = '[GUARD]: Your commit message not match pattern "ADD|RM|UP|FIX|WIP:" or "Merge|Revert|Finish"';

console.log('[GUARD]: validate commit message...');

try {
    const commitMsg = fs.readFileSync(process.argv[2], 'utf8');
    if (!commitRegExp.test(commitMsg)) {
        console.error(errorMsg);
        process.exit(1);
    }
} catch (err) {
    console.error('[GUARD]: Error: Commit message file not found in git repo');
}
