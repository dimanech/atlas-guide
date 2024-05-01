import fs from 'node:fs';
import path from 'node:path';
import cssstat from '@dimanech/cssstat-core';

const getProjectStat = (projectName, cssSrc, cssExcludedFiles) => {
    let projectCssStat = [];
    let contaminatedCss = '';
    let filesSizes = [];

    fs.readdirSync(cssSrc).forEach((file) => {
        const filePath = path.join(cssSrc, file);
        const fileStat = fs.statSync(filePath);

        if (
            fileStat.isFile() &&
            path.extname(file) === '.css' &&
            !cssExcludedFiles.test(file)
        ) {
            const fileContent = fs.readFileSync(filePath, 'utf8');

            projectCssStat.push({
                name: path.basename(file),
                stat: cssstat(fileContent, {
                    importantDeclarations: true,
                    mediaQueries: false,
                }),
            });

            const sizesStat = projectCssStat[projectCssStat.length - 1].stat;

            filesSizes.push({
                name: path.basename(file),
                raw: sizesStat.size,
                zipped: sizesStat.gzipSize,
                view: {
                    raw: sizesStat.humanizedSize,
                    zipped: sizesStat.humanizedGzipSize,
                },
            });

            contaminatedCss += fileContent;
        }
    });

    projectCssStat.unshift({
        name: projectName,
        stat: cssstat(contaminatedCss),
        filesSizes: filesSizes,
    });

    return projectCssStat;
};

export default getProjectStat;
