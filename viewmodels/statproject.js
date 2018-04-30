'use strict';

const dataUri = require('./statproject/dataUri');
const totalsDeclarations = require('./statproject/totalsDeclarations');
const ruleSizeStat = require('./statproject/ruleSizeStat');
const selectors = require('./statproject/selectors');
const selectorsListTops = require('./statproject/selectorsListTops');
const specificityTops = require('./statproject/specificityTops');
const uniques = require('./statproject/uniques');
const uniquesChart = require('./statproject/uniquesChart');
const fileSizesChart = require('./statproject/fileSizesChart');
const totals = require('./statproject/totals');

const charts = require('./statproject/charts');
const specificityChart = charts.specificityChart;
const ruleSizeChart = charts.ruleSizeChart;

function size(stats) {
    return {
        raw: stats.size,
        zipped: stats.gzipSize,
        view: {
            raw: stats.humanizedSize,
            zipped: stats.humanizedGzipSize
        }
    };
}

function importantRules(rules) {
    // should be with selectors
    const isHaveRules = rules !== undefined;
    return {
        'count': isHaveRules ? rules.length : 0,
        'rules': isHaveRules ? rules : []
    };
}

function statProject(stat) {
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
}

module.exports = statProject;
