import { getProjectConstants } from '../../models/projectconstants.mjs';
import getStatFor from '../../models/componentstat.mjs';
import renderedPageContent from '../../models/pagecontent.mjs';
import statistics from '../../viewmodels/statcomponent.mjs';
import coverage from '../../viewmodels/coverage.mjs';
import styleguide from '../../viewmodels/styleguide.mjs';
import { getFileImports } from '../../models/projectimportsgraph.mjs';

export default function(atlasConfig, projectTree, projectImportsGraph) {
    const projectConstants = getProjectConstants(atlasConfig.constants, atlasConfig.scssAdditionalImportsArray, atlasConfig.constants.constantsFile);
    const componentImports = src => getFileImports(src, projectImportsGraph);

    // Prepare guide page content model depending on component type
    function prepareContent(component) {
        let content;
        let tableOfContent;
        let stat;
        let page;
        let isNeedStat;

        if (component.src !== '') { // could be stat pages or custom defined file
            page = renderedPageContent(component.src, {'title': component.title});
            content = page.content;
            tableOfContent = page.toc;
            isNeedStat = page.isNeedStat;
        }
        switch (component.type) {
            case 'styleguide':
                content = styleguide(projectConstants);
                break;
            case 'component':
            case 'container':
                if (isNeedStat) {
                    stat = statistics(
                        getStatFor(component.src, atlasConfig.componentPrefixes),
                        componentImports(component.src),
                        projectConstants
                    );
                }
                break;
            case 'about':
                stat = {
                    'projectName': atlasConfig.projectInfo.name,
                    'coverage': coverage(projectTree.coverage)
                };
                break;
        }

        return {
            documentation: content,
            toc: tableOfContent,
            componentStats: stat
        };
    }

    return { prepareContent };
}
