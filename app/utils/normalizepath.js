'use strict';

const path = require('path');
const cwd = process.cwd();

function normalizePath(url) {
    if (url !== undefined) {
        return path.isAbsolute(url) ? url : path.join(cwd, url);
    } else {
        return url;
    }
}

module.exports = normalizePath;
