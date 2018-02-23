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

function componentProfileChart(dataArr) {
    // const width = 250;
    const height = 250;
    const margin = 10;
    const innerRadius = 5;
    const outerRadius = (height / 2) - (margin * 2);
    const data = dataArr;
    data.push(data[0]); // close the circle

    const max = Math.max(...data); // < 4 ? 4 : Math.max(dataValues)

    const angle = d3scale.scaleLinear()
        .domain([0, data.length - 1])
        .range([0, Math.PI * 2]);

    const radius = d3scale.scaleLinear()
        .domain([0, max])
        .range([innerRadius, outerRadius]);

    return d3shape.areaRadial()
        .angle((d, i) => angle(i))
        .innerRadius(0)
        .outerRadius(d => radius(d))(data);
}

function getStatistic(componentStat, componentImports) {
    const componentProfile = [
        'padding', 'display', 'position', 'width', 'height',
        'margin', 'scale', 'font', 'color', 'background'
    ];
    const stats = ['important', 'vendorPrefix', 'floats'];
    let chartData = [];
    let viewModel = {
        includes: _uniq(componentStat.includes.sort()),
        imports: _uniq(componentStat.imports),
        variables: componentStat.variables,
        importedBy: componentImports.importedBy,
        nodes: componentStat.componentStructure.nodes, // component structure recursion
        totalDeclarations: humanize(componentStat.totalDeclarations),
        ruleSetsLine: ruleSetChart(componentStat.ruleSets),
        componentProfileDetails: {},
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
        viewModel.componentProfileDetails[stat] = {
            total: rawStatLength,
            values: rawStat
        };
        chartData.push(rawStatLength);
    });

    viewModel.componentProfileShape = componentProfileChart(chartData);

    return viewModel;
}

module.exports = getStatistic;
