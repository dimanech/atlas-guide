import fs from 'node:fs';
import path from 'node:path';

const getFileSize = (string) => Buffer.byteLength(string, 'utf8');

const getFileString = (filePath) => {
    let fileString = '';
    if (fs.existsSync(filePath)) {
        fileString = fs.readFileSync(filePath, 'utf8');
    }
    return fileString;
}

const getFileSizeWithoutComments = (filePath) => {
    const fileString = getFileString(filePath);
    const stripedFile = fileString.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

    return getFileSize(stripedFile);
}

const getResultedFileSize = (fileName, pathToCSS) => {
    const filePath = path.join(pathToCSS, fileName.replace(/\.scss/, '.css'));
    const fileString = getFileString(filePath);

    return getFileSize(fileString);
}

export { getFileSizeWithoutComments, getResultedFileSize };
