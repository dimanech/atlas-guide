import path from 'node:path';
import cssStatFunc from '../models/projectcssstat.mjs';
import projectFileSizesFunc from '../models/projectfilesize.mjs';
import bundleFunc from '../models/projectbundle.mjs';
import statFileWeight from '../viewmodels/statfileweight.mjs';
import statProject from '../viewmodels/statproject.mjs';
import statCrossDeps from '../viewmodels/statcrossdeps.mjs';
import statImports from '../viewmodels/statimports.mjs';

export default function(atlasConfig, projectTree, importsGraph, writePage) {
    const projectName = atlasConfig.projectInfo.name;
    const guideSrc = atlasConfig.guideSrc;
    const guideDest = atlasConfig.guideDest;
    const cssSrc = atlasConfig.cssSrc;
    const excludedCssFiles = atlasConfig.excludedCssFiles;
    const excludedSassFiles = atlasConfig.excludedSassFiles;

    const cssStat = cssStatFunc(projectName, cssSrc, excludedCssFiles);
    const projectFileSizes = projectFileSizesFunc(guideSrc);
    const bundle = bundleFunc(importsGraph, projectName, cssSrc, excludedSassFiles);

    const reportsPages = [{
        id: 'bundle',
        title: 'bundle',
        target: path.join(guideDest, '/bundle.html'),
        template: 'bundle',
        type: 'bundle',
        content: {
            weight: statFileWeight(projectFileSizes),
            crossDeps: statCrossDeps(importsGraph, excludedSassFiles),
            tree: bundle,
            bundleImports: statImports(importsGraph, excludedSassFiles)
        }
    }, {
        id: 'insights',
        title: 'insights',
        target: path.join(guideDest, '/insights.html'),
        template: 'insights',
        type: 'insights',
        content: statProject(cssStat, projectName)
    }];

    return {
        buildReports: () => Promise.all(reportsPages.map(writePage))
    };
};
