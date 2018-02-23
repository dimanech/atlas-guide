'use strict';

const fs = require('fs');
const path = require('path');
const cssstat = require('cssstats');

function getProjectStat(projectName, cssSrc, cssExcludedFiles) {
    let projectCssStat = [];
    let contaminatedCss = '';
    let filesSizes = [];

    fs.readdirSync(cssSrc).forEach((file, index, dir) => {
        const fileName = dir[index];
        const filePath = path.join(cssSrc, fileName);
        const fileStat = fs.statSync(filePath);

        if (fileStat.isFile() && path.extname(fileName) === '.css' && !cssExcludedFiles.test(fileName)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');

            projectCssStat.push({
                'name': path.basename(fileName),
                'stat': cssstat(fileContent)
            });

            // Prepare global project stat
            const sizesStat = projectCssStat[projectCssStat.length - 1].stat;
            filesSizes.push({
                'name': path.basename(fileName),
                'raw': sizesStat.size,
                'zipped': sizesStat.gzipSize,
                'view': {
                    raw: sizesStat.humanizedSize,
                    zipped: sizesStat.humanizedGzipSize
                }
            });
            contaminatedCss += fileContent;
        }
    });

    projectCssStat.unshift({
        'name': projectName,
        'stat': cssstat(contaminatedCss), // this is very bad, change me later
        'filesSizes': filesSizes
    });

    return projectCssStat;
}

module.exports = getProjectStat;
