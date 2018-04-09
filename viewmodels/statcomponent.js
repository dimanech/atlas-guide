'use strict';

const _uniq = require('lodash.uniq');
const formatNumbers = require(__dirname + '/utils/format').numbers;

const getConstantsUsage = require('./statcomponent/getConstantsUsage');
const ruleSetChart = require('./statcomponent/ruleSetChart');

function getStatistic(componentStat, componentImports, projectConstants) {
    const constants = [
        'margin', 'padding',
        'fontSize',
        'fontFamily',
        'color', 'backgroundColor',
        'mediaQuery'
    ];
    const stats = ['important', 'vendorPrefix', 'float'];

    let viewModel = {
        includes: _uniq(componentStat.includes.sort()),
        imports: _uniq(componentStat.imports),
        variables: componentStat.variables,
        importedBy: componentImports.importedBy,
        nodes: componentStat.componentStructure.nodes, // component structure recursion
        totalDeclarations: formatNumbers(componentStat.totalDeclarations),
        ruleSetsLine: ruleSetChart(componentStat.ruleSets),
        usedConstants: [],
        stats: {},
        mostProps: componentStat.mostProps
    };

    stats.forEach(stat => {
        viewModel.stats[stat] = {
            total: componentStat.stats[stat].length,
            values: componentStat.stats[stat]
        };
    });

    if (projectConstants !== undefined) {
        constants.forEach(name => {
            const rawStat = name !== 'mediaQuery' ? componentStat.stats[name] : _uniq(componentStat.mediaQuery);
            const constStat = getConstantsUsage(name, rawStat, projectConstants);
            if (constStat !== undefined) {
                viewModel.usedConstants.push({
                    consistency: constStat,
                    name: name
                });
            }
        });
    }

    return viewModel;
}

module.exports = getStatistic;
