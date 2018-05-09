'use strict';

const fs = require('fs');
const path = require('path');

function getfileSize(string) {
    return Buffer.byteLength(string, 'utf8');
}

function getfileSizeWithoutComments(path) {
    const fileString = fs.readFileSync(path, 'utf8');
    const stripedFile = fileString.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

    return getfileSize(stripedFile);
}

function getResultedFileSize(name, pathToCSS) {
    const filePath = path.join(pathToCSS, name.replace(/\.scss/, '.css'));
    let fileString = '';

    if (fs.existsSync(filePath)) {
        fileString = fs.readFileSync(filePath, 'utf8');
    }

    return getfileSize(fileString);
}

module.exports = {
    getFileSize: getfileSize,
    getFileSizeWithoutComments: getfileSizeWithoutComments,
    getResultedCSSFileSize: getResultedFileSize
};
