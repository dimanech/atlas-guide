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
    let notUsed = [];
    let notUsedCount = 0;
    let used = [];
    let couldBeChanged = [];
    let all = 0;

    valuesList.forEach(value => {
        let isConstantAlreadyFound = false;
        all++;

        constantsList.forEach(constant => {
            if (isConstantAlreadyFound) {
                return;
            }
            // push defined and used constant
            // interpolation and operators could be used with variable so we need a regexp for this
            if (new RegExp('\\' + constant.name + '|auto|inherit|initial').test(value)) {
                used.push(value);
                isConstantAlreadyFound = true;
            }
            // push suggestion that could be changed
            if (value === constant.value) {
                used.push(value);
                isConstantAlreadyFound = true;

                let alreadyExist = false;
                couldBeChanged.forEach(warn => {
                    if (warn.from === value && warn.to === constant.name) {
                        warn.count++;
                        alreadyExist = true;
                    }
                });
                if (!alreadyExist) {
                    couldBeChanged.push({
                        from: value,
                        to: constant.name,
                        count: 1
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
        if (!isConstantAlreadyFound) {
            let alreadyExist = false;

            notUsed.forEach(error => {
                if (error.value === value) {
                    error.count++;
                    notUsedCount++;
                    alreadyExist = true;
                }
            });
            if (!alreadyExist) {
                notUsed.push({
                    value: value,
                    count: 1
                });
                notUsedCount++;
            }
        }
    });

    return {
        'notInConstants': {
            count: notUsedCount,
            values: notUsed
        },
        'allOk': all === used.length,
        'consider': couldBeChanged
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
        case 'mediaQuery':
            displayName = singular ? 'Media query' : 'Media queries';
            break;
        case 'boxShadow':
            displayName = 'Box shadow';
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
    const constants = [
        'padding', 'margin', 'fontSize', 'fontFamily', 'color', 'backgroundColor',
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
