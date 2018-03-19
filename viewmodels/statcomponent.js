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
    let all = 0;

    valuesList.forEach(value => {
        let isConstantFound = false;
        all++;

        constantsList.forEach(constant => {
            if (isConstantFound) {
                return;
            }
            if (new RegExp('\\' + constant.name + '|auto|inherit|initial').test(value)) {
                // interpolation and operators could be used with variable
                defined.push(value);
                isConstantFound = true;
            }
            if (value === constant.value) {
                defined.push(value);
                isConstantFound = true;
                let alreadyExist = false;
                consider.forEach(warn => {
                    if (warn.from === value && warn.to === constant.name) {
                        warn.count++;
                        alreadyExist = true;
                    }
                });
                if (!alreadyExist) {
                    consider.push({
                        from: value,
                        to: constant.name,
                        count: 0
                    });
                }
            }
            // if (/\$/.test(value)) {// if var used should be warn
            //     defined.push(value);
            //     warn.push({
            //         from: value
            //     });
            //     isConstantFound = true;
            // }
        });
        if (!isConstantFound) {
            notDefined.push(value);
        }
    });

    return {
        'notInConstants': {
            count: notDefined.length,
            values: notDefined
        },
        'allOk': all === defined.length,
        'consider': consider
    };
}

function getConstantsStat(name, valuesList, constants) {
    const constantsMap = {
        scale: ['fontSize'],
        font: ['fontFamily'],
        space: ['margin', 'padding'],
        color: ['color', 'backgroundColor'],
        breakpoint: ['mediaQuery'],
        depth: ['boxShadow']
    };
    let constantsList = [];

    Object.keys(constantsMap).forEach(key => {
        constantsMap[key].forEach(prop => {
            if (prop === name) {
                constantsList = constants[key];
            }
        });
    });

    if (constantsList.length > 0 && valuesList.length > 0) {
        return warnConstants(valuesList, constantsList);
    } else {
        return undefined;
    }
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
            displayName = singular ? 'Background' : 'Backgrounds';
            break;
        default:
            displayName = singular ? name : name + 's';
    }
    return displayName;
}

function getStatistic(componentStat, componentImports, projectConstants) {
    const componentProfile = [
        'padding', 'display', 'position', 'width', 'height',
        'margin', 'fontSize', 'fontFamily', 'color', 'backgroundColor',
        'mediaQuery', 'boxShadow' // add missing constants props
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
        const rawStat = name !== 'mediaQuery' ? componentStat.stats[name] : _uniq(componentStat.mediaQuery);
        const rawStatLength = rawStat.length;
        let result = {
            total: rawStatLength,
            name: prepareDisplayName(name, rawStatLength === 1)
        };
        if (projectConstants !== undefined) {
            const constStat = getConstantsStat(name, rawStat, projectConstants);
            if (constStat !== undefined) {
                result.consistancy = constStat;
            }
        }
        viewModel.componentProfileDetails.push(result);
    });

    viewModel.componentProfileDetails.sort((a, b) => b.total - a.total);

    return viewModel;
}

module.exports = getStatistic;
