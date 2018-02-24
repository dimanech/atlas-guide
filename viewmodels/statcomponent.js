'use strict';

const _uniq = require('lodash.uniq');
const d3fmt = require('d3-format');
const d3scale = require('d3-scale');
const d3shape = require('d3-shape');

function humanize(number) {
    if (!number) {
        return 0;
    }
    const length = number.toString().length;

    if (length > 4) {
        return d3fmt.format('.2s')(number);
    } else {
        return d3fmt.format(',')(number);
    }
}

function ruleSetChart(dataArr) {
    const width = 290;
    const height = 64;
    const max = Math.max(...dataArr);
    const scaleX = d3scale.scaleLinear()
        .domain([0, dataArr.length])
        .range([0, width]);

    const scaleY = d3scale.scaleLinear()
        .domain([0, max < 5 ? 5 : max])
        .range([height, 0]);

    return d3shape.line()
        .x((d, i) => scaleX(i))
        .y(d => scaleY(d))
        .curve(d3shape.curveCatmullRom.alpha(0.5))(dataArr);
}

function getStatistic(componentStat, componentImports) {
    const componentProfile = [
        'padding', 'display', 'position', 'width', 'height',
        'margin', 'scale', 'font', 'color', 'background'
    ];
    const stats = ['important', 'vendorPrefix', 'floats'];
    let viewModel = {
        includes: _uniq(componentStat.includes.sort()),
        imports: _uniq(componentStat.imports),
        variables: componentStat.variables,
        importedBy: componentImports.importedBy,
        nodes: componentStat.componentStructure.nodes, // component structure recursion
        totalDeclarations: humanize(componentStat.totalDeclarations),
        ruleSetsLine: ruleSetChart(componentStat.ruleSets),
        componentProfileDetails: [],
        stats: {}
    };

    stats.forEach(stat => {
        viewModel.stats[stat] = {
            total: componentStat.stats[stat].length,
            values: componentStat.stats[stat]
        };
    });

    componentProfile.forEach(stat => {
        const rawStat = componentStat.stats[stat];
        const rawStatLength = rawStat.length;
        viewModel.componentProfileDetails.push({
            total: rawStatLength,
            name: rawStatLength === 1 ? stat : stat + 's',
            values: rawStat
        });
    });

    viewModel.componentProfileDetails.sort((a, b) => b.total - a.total);

    return viewModel;
}

module.exports = getStatistic;
