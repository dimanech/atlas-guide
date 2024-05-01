import dataUri from './statproject/dataUri.mjs';
import totalsDeclarations from './statproject/totalsDeclarations.mjs';
import ruleSizeStat from './statproject/ruleSizeStat.mjs';
import selectors from './statproject/selectors.mjs';
import selectorsListTops from './statproject/selectorsListTops.mjs';
import specificityTops from './statproject/specificityTops.mjs';
import uniques from './statproject/uniques.mjs';
import uniquesChart from './statproject/uniquesChart.mjs';
import fileSizesChart from './statproject/fileSizesChart.mjs';
import totals from './statproject/totals.mjs';
import { specificityChart, ruleSizeChart } from './statproject/charts.mjs';

const size = (stats) => {
    return {
        raw: stats.size,
        zipped: stats.gzipSize,
        view: {
            raw: stats.humanizedSize,
            zipped: stats.humanizedGzipSize
        }
    };
};

const importantRules = (rules) => {
    // should be with selectors
    const isHaveRules = rules !== undefined;
    return {
        'count': isHaveRules ? rules.length : 0,
        'rules': isHaveRules ? rules : []
    };
};

const statProject = (stat) => {
    let projectCssStat = [];

    stat.forEach(bundle => {
        const name = bundle.name;
        const stats = bundle.stat;

        return projectCssStat.push({
            name: name,
            size: size(stats),
            sizes: bundle.filesSizes !== undefined ? fileSizesChart(bundle.filesSizes) : '',
            totals: totals(stats),
            totalsDeclarations: totalsDeclarations(stats),
            uniques: uniques(stats),
            uniquesChart: uniquesChart(stats),
            specificityChart: specificityChart(stats),
            specificityTops: specificityTops(stats.selectors.getSpecificityValues()),
            rulesizeChart: ruleSizeChart(stats),
            rulesizeTops: ruleSizeStat(stats.rules.selectorRuleSizes),
            selectorsListTops: selectorsListTops(stats.selectors.selectorsLists),
            selectors: selectors(stats.selectors),
            importantRules: importantRules(stats.declarations.important),
            dataUri: dataUri(
                stats.declarations.properties.background,
                stats.declarations.properties['background-image'],
                stats.fontFaces)
        });
    });

    return projectCssStat;
};

export default statProject;
