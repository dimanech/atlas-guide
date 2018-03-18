'use strict';

const _uniq = require('lodash.uniq');
const d3scale = require('d3-scale');
const d3shape = require('d3-shape');
const formatNumbers = require(__dirname + '/utils/format').numbers;

function ruleSetChart(dataArr) {
    const width = 290;
    const height = 64;
    const max = Math.max(...dataArr);
    const scaleX = d3scale.scaleLinear()
        .domain([0, dataArr.length - 1])
        .range([0, width]);

    const scaleY = d3scale.scaleLinear()
        .domain([0, max < 5 ? 5 : max])
        .range([height, 0]);

    return d3shape.line()
        .x((d, i) => scaleX(i))
        .y(d => scaleY(d))
        .curve(d3shape.curveCatmullRom.alpha(0.5))(dataArr);
}

function warnConstants(valuesList, constantsList) {
    let notDefined = [];
    let defined = [];
    let consider = [];

    valuesList.forEach(value => {
        let isConstantFound = false;

        constantsList.forEach(constant => {
            if (isConstantFound) {
                return;
            }
            if (value === constant.name) {
                defined.push(value);
                isConstantFound = true;
            } else if (value === constant.value) {
                defined.push(value);
                consider.push({
                    from: value,
                    to: constant.name
                });
                isConstantFound = true;
            }
        });
        if (!isConstantFound) {
            notDefined.push(value);
        }
    });

    return {
        'notDefined': {
            count: notDefined.length,
            values: notDefined
        },
        'defined': {
            count: defined.length,
            values: defined
        },
        'consider': consider // 2rem could be changed to [$space-md](link to styleguide)
    };
}

function getConstantsStat(componentStat, projectConstants) {
    const definedConstantsList = [];
    const constantsMap = {
        scale: ['fontSize'],
        font: ['fontFamily'],
        space: ['margin', 'padding'],
        color: ['color', 'backgroundColor'],
        depth: ['boxShadow']
    };
    let constantsStat = [];

    // get defined constants
    Object.keys(projectConstants).forEach(constant => {
        if (constant.length > 0) {
            return definedConstantsList.push(constant);
        }
    });

    // map constants to css props
    definedConstantsList.forEach(key => {
        if (constantsMap[key] === undefined) {
            return;
        }
        let values = [];

        constantsMap[key].forEach(item => {
            const stat = componentStat.stats[item];
            return values.push(...stat);
        });

        constantsStat.push({
            'name': key,
            'valuesList': values,
            'constantsList': projectConstants[key]
        });
    });

    constantsStat.forEach(item => {
        if (item.constantsList.length !== 0) {
            item.stat = warnConstants(item.valuesList, item.constantsList);
        }
        delete item.valuesList;
        delete item.constantsList;
    });

    return constantsStat;
}

function prepareDisplayName(name, singular) {
    let displayName;
    switch (name) {
        case 'fontFamily':
            displayName = singular ? 'Font family' : 'Font families';
            break;
        case 'fontSize':
            displayName = singular ? 'Font size' : 'Font sizes';
            break;
        case 'backgroundColor':
            displayName = singular ? 'Background color' : 'Background colors';
            break;
        default:
            displayName = singular ? name : name + 's';
    }
    return displayName;
}

function getStatistic(componentStat, componentImports, projectConstants) {
    const componentProfile = [
        'padding', 'display', 'position', 'width', 'height',
        'margin', 'fontSize', 'fontFamily', 'color', 'backgroundColor'
    ];
    const stats = ['important', 'vendorPrefix', 'float'];

    let viewModel = {
        includes: _uniq(componentStat.includes.sort()),
        imports: _uniq(componentStat.imports),
        variables: componentStat.variables,
        importedBy: componentImports.importedBy,
        mediaQuery: _uniq(componentStat.mediaQuery),
        nodes: componentStat.componentStructure.nodes, // component structure recursion
        totalDeclarations: formatNumbers(componentStat.totalDeclarations),
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

    componentProfile.forEach(name => {
        const rawStat = componentStat.stats[name];
        const rawStatLength = rawStat.length;
        viewModel.componentProfileDetails.push({
            total: rawStatLength,
            name: prepareDisplayName(name, rawStatLength === 1)
            // values: rawStat
        });
    });

    viewModel.componentProfileDetails.sort((a, b) => b.total - a.total);

    if (projectConstants !== undefined) {
        const componentConstants = getConstantsStat(componentStat, projectConstants);

        componentConstants.push({
            'name': 'breakpoint',
            'stat': warnConstants(componentStat.mediaQuery, projectConstants.breakpoint)
        });

        viewModel.componentConstants = componentConstants;
    }

    // require('fs').writeFileSync('./componentStat.json', JSON.stringify(viewModel, null, '\t'))

    return viewModel;
}

module.exports = getStatistic;
