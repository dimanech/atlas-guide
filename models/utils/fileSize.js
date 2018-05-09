'use strict';

const fs = require('fs');
const path = require('path');

function getFileSize(string) {
    return Buffer.byteLength(string, 'utf8');
}

function getFileString(path) {
    let fileString = '';
    if (fs.existsSync(path)) {
        fileString = fs.readFileSync(path, 'utf8');
    }
    return fileString;
}

/**
 * Get file size without "C"-style comments
 * @param path
 * @return {int} file size in bytes
 */
function getFileSizeWithoutComments(path) {
    const fileString = getFileString(path);
    const stripedFile = fileString.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

    return getFileSize(stripedFile);
}

/**
 * Get file size of compiled CSS file from SCSS standalone file name as argument
 * @param {string} fileName - name of standalone SCSS file
 * @param {string} pathToCSS - absolute path to CSS files directory
 * @return {int} file size in bytes
 */
function getResultedFileSize(fileName, pathToCSS) {
    const filePath = path.join(pathToCSS, fileName.replace(/\.scss/, '.css'));
    const fileString = getFileString(filePath);

    return getFileSize(fileString);
}

module.exports = {
    getFileSizeWithoutComments: getFileSizeWithoutComments,
    getResultedCSSFileSize: getResultedFileSize
};
