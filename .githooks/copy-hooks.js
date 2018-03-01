#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');

/*
 * Hook filename
 */
const hooks = [
    'commit-msg',
    'post-merge',
    'post-update',
    'pre-commit'
];

const gitRepo = path.resolve(process.cwd(), '.git');
const gitHooksDir = path.resolve(gitRepo, 'hooks');
const hooksDir = path.resolve(process.cwd(), '.githooks');

/*
 * `.git/hooks` folder
 */
if (!fs.existsSync(gitHooksDir)) {
    fs.mkdirSync(gitHooksDir);
}

/*
 * Copy hooks
 */
hooks.forEach(function (hookName) {
    fs.readFile(path.resolve(hooksDir, hookName), 'utf8', (err, content) => {
        const gitHookPath = path.resolve(gitHooksDir, hookName);

        try {
            fs.writeFile(gitHookPath, content, {mode: '0777'}, () => {});
        } catch (e) { // node 0.8 fallback
            fs.writeFile(gitHookPath, content, 'utf8', () => {
                fs.chmod(gitHookPath, '0777');
            });
        }
    });
});
