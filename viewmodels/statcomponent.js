'use strict';

const _uniq = require('lodash.uniq');
const formatNumbers = require(__dirname + '/utils/format').numbers;

const getConstantsStat = require('./statcomponent/getConstantsStat');
const ruleSetChart = require('./statcomponent/ruleSetChart');
const prepareDisplayName = require('./statcomponent/prepareDisplayName');

function getStatistic(componentStat, componentImports, projectConstants) {
    const componentProfile = [
        'padding', 'display', 'position', 'width', 'height',
        'margin', 'fontSize', 'fontFamily', 'color', 'backgroundColor'
    ];
    const constants = ['padding', 'margin', 'fontSize', 'fontFamily', 'color', 'backgroundColor', 'mediaQuery'];
    const stats = ['important', 'vendorPrefix', 'float'];

    let viewModel = {
        includes: _uniq(componentStat.includes.sort()),
        imports: _uniq(componentStat.imports),
        variables: componentStat.variables,
        importedBy: componentImports.importedBy,
        nodes: componentStat.componentStructure.nodes, // component structure recursion
        totalDeclarations: formatNumbers(componentStat.totalDeclarations),
        ruleSetsLine: ruleSetChart(componentStat.ruleSets),
        componentProfileDetails: [],
        usedConstants: [],
        stats: {}
    };

    stats.forEach(stat => {
        viewModel.stats[stat] = {
            total: componentStat.stats[stat].length,
            values: componentStat.stats[stat]
        };
    });

    componentProfile.forEach(name => {
        const rawStat = componentStat.stats[name];
        const rawStatLength = rawStat.length;
        viewModel.componentProfileDetails.push({
            total: rawStatLength,
            name: prepareDisplayName(name, rawStatLength === 1)
        });
    });

    if (projectConstants !== undefined) {
        constants.forEach(name => {
            const rawStat = name !== 'mediaQuery' ? componentStat.stats[name] : _uniq(componentStat.mediaQuery);
            const constStat = getConstantsStat(name, rawStat, projectConstants);
            if (constStat !== undefined) {
                viewModel.usedConstants.push({
                    consistency: constStat,
                    name: name
                });
            }
        });
    }

    viewModel.componentProfileDetails.sort((a, b) => b.total - a.total);

    return viewModel;
}

module.exports = getStatistic;
