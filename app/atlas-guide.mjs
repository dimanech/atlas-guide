import getBaseConfig from '../models/atlasconfig.mjs';
import makeProjectTree from '../models/projectdocumentedtree.mjs';
import {getImportsGraph, getFileImports} from '../models/projectimportsgraph.mjs';
import writePageModule from './utils/writepage.mjs';
import buildComponentModule from './buildcomponet.mjs';
import buildReportsModule from './buildreports.mjs';
import copyAssets from './utils/copyassets.mjs';

export default function withConfig(configPath) {
    const atlasConfig = getBaseConfig(configPath);

    if (atlasConfig.isCorrupted) {
        return {
            'build': () => new Promise(resolve => resolve('Config is corrupted')),
            'buildAll': () => new Promise(resolve => resolve('Config is corrupted'))
        };
    }

    const projectTree = makeProjectTree(atlasConfig);
    const projectImports = null ;// getFileImports(atlasConfig); // TODO remove me!! projectImportsModule passed to buildComponentModule prepareCOntentModule ;
    const projectImportsGraph = getImportsGraph(atlasConfig);

    const writePage = writePageModule(atlasConfig, projectTree).writePage;

    const buildComponent = buildComponentModule(atlasConfig, projectTree, projectImportsGraph,
        projectImports, writePage).buildComponent;

    const buildReports = buildReportsModule(atlasConfig, projectTree, projectImportsGraph,
        writePage).buildReports;

    if (atlasConfig.copyInternalAssets) {
        copyAssets(atlasConfig.internalAssetsPath, atlasConfig.guideDest);
    }

    return {
        'build': buildComponent,
        'buildAll': () => Promise.all([
            buildComponent(),
            buildReports()
        ])
    };
}
