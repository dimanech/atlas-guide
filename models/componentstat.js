'use strict';

const fs = require('fs');
const path = require('path');

const color = require('d3-color');
const _camelCase = require('lodash.camelcase');

const postcss = require('postcss');
const scss = require('postcss-scss');

let componentPrefixRegExp;
// check invalid scss handling

function guessType(name) {
    let type;
    switch (true) {
        // parse prefix
        case /^include/.test(name):
            type = 'mixin';
            break;
        case /^extend/.test(name):
            type = 'extend';
            break;
        case /(^media)|(^supports)|(^if)/.test(name):
            type = 'condition';
            break;
        case /^&\./.test(name):
            type = 'modifier-adjacent';
            break;
        // parse suffixes
        case /([a-z&\d]_[a-z\d-]*$)|(--.*$)/.test(name): // move to config
            type = 'modifier';
            break;
        case /[a-z&\d]__[a-z\d]*$/.test(name):
            type = 'element';
            break;
        case /::.*$/.test(name):
            type = 'element-implicit';
            break;
        case /:.*$/.test(name):
            type = 'modifier-implicit';
            break;
        case /[a-z\d] &/.test(name):
            type = 'modifier-context';
            break;
        // parse prefix again
        case componentPrefixRegExp.test(name):
            // if no prefix defined we should mark first level selectors as component.
            // isRootImmediateChild arg could be used
            type = 'component';
            break;
        default:
            type = 'element';
            break;
    }
    // implement me - orphan element (element from another component or element without root)
    // context modification from another component - this should be warn
    // ".b-promo-box_top .b-promo-box__content" should be modifier
    return type;
}

function getComponentStructure(fileAST) {
    let componentStructure = {
        'node': 'root',
        'nodes': []
    };

    function deconstructStructure(nodes, structure) {
        if (!nodes) {
            return;
        }
        nodes.forEach(node => {
            if (node.type === 'atrule' || node.type === 'rule') {
                if (node.name === 'keyframes' || node.name === 'import') {
                    return;
                }
                // let isAnnotated;
                // try {
                //     isAnnotated = node.nodes[0].text;
                // } catch (e) {
                //     isAnnotated = '';
                // }
                const nodeSelector = node.selector || node.name + ' ' + node.params;
                const componentType = guessType(nodeSelector);
                structure.push({
                    'node': nodeSelector,
                    // 'annotation': isAnnotated ? node.nodes[0].text : '',
                    'type': guessType(nodeSelector),
                    'isBlock': componentType !== 'mixin',
                    'nodes': []
                });
                deconstructStructure(node.nodes, structure[structure.length - 1].nodes);
            }
        });
    }
    deconstructStructure(fileAST.nodes, componentStructure.nodes);

    return componentStructure;
}

function getRuleSets(fileAST) {
    let ruleSets = [];

    fileAST.walkRules(rule => {
        let declarations = 0;
        rule.nodes.forEach(node => {
            if (node.type === 'decl') {
                declarations++;
            }
        });
        ruleSets.push(declarations);
    });

    return ruleSets;
}

function getAtRules(fileAST) {
    let atRules = {
        includes: [],
        imports: [],
        mediaQuery: []
    };

    fileAST.walkAtRules(atrule => {
        if (atrule.name === 'include') {
            atRules.includes.push(atrule.params);
        }

        if (atrule.name === 'import') {
            atRules.imports.push(atrule.params);
        }

        if (atrule.name === 'media') {
            atRules.mediaQuery.push(atrule.params);
        }
    });

    return atRules;
}

function getFontStat(value) {
    const declList = value
        .replace(/ ,/g, ',')
        .replace(/ \/ ?/g, '/')
        .split(' ');
    const fontFamily = declList.pop(); // mandatory. always last in list
    const fontSize = declList.pop().split('/'); // mandatory. before family. optional list

    return {
        fontSize: fontSize[0],
        fontFamily: fontFamily
    };
}

function getBackgroundStat(value) {
    const finalLayer = value.split(',');
    const layerPropsList = finalLayer.pop().split(' ');
    let backgroundColors = [];

    layerPropsList.forEach(prop => {
        if (color.hsl(prop).displayable() || /(^\$|^--)/.test(prop)) {
            return backgroundColors.push(prop);
        }
    });

    return backgroundColors;
}

function getDeclarationsStats(fileAST) {
    let stats = {
        'fontSize': [],
        'fontFamily': [],
        'margin': [],
        'padding': [],
        'color': [],
        'backgroundColor': [],
        'important': [],
        'width': [],
        'height': [],
        'vendorPrefix': [],
        'zIndex': [],
        'position': [],
        'float': [],
        'display': [],
        'boxShadow': []
    };
    let totalDeclarations = 0;
    let variables = [];

    fileAST.walkDecls(function(decl) {
        if (decl.parent.selector !== undefined && /^\d/.test(decl.parent.selector)) {
            // ignore animation declaration blocks
            return;
        }

        totalDeclarations++;

        [// health
            'float',
            // useful
            'z-index',
            // component profile
            'width',
            'height',
            'position',
            'color',
            'background-color',
            'font-family',
            'font-size',
            'box-shadow'
        ].forEach(prop => {
            if (decl.prop === prop.toString()) {
                stats[_camelCase(prop)].push(decl.value);
            }
        });

        // Health

        if (decl.important) {
            stats.important.push({
                prop: decl.prop
            });
        }

        if (/^-/.test(decl.prop)) {
            stats.vendorPrefix.push({
                prop: decl.prop,
                value: decl.value
            });
        }

        // Useful

        if (/(^\$|^--)/.test(decl.prop)) {
            variables.push({
                prop: decl.prop,
                value: decl.value
            });
        }

        // Profile

        ['margin', 'padding'].forEach(item => {
            const regexp = new RegExp('^' + item);
            // we need to cover several cases here - margin, margin-top, margin-start, etc.
            if (regexp.test(decl.prop)) {
                const metricList = decl.value.split(' ');
                metricList.forEach(value => stats[item].push(value));
            }
        });

        if (decl.prop === 'display') { // only layout display. Check probability of block, i-b usage in components?
            if (/(flex|grid)/.test(decl.value)) {
                stats.display.push(decl.value);
            }
        }

        if (decl.prop === 'background') {
            stats.backgroundColor.concat(getBackgroundStat(decl.value));
        }

        if (decl.prop === 'font') {
            const fontStat = getFontStat(decl.value);
            stats.fontSize.push(fontStat.fontSize);
            stats.fontFamily.push(fontStat.fontFamily);
        }
    });

    return {
        stats: stats,
        totalDeclarations: totalDeclarations,
        variables: variables
    };
}

function getStatistic(file) {
    const fileAST = postcss().process(file, {parser: scss}).root;
    const stats = getDeclarationsStats(fileAST);
    const atRules = getAtRules(fileAST);

    return {
        includes: atRules.includes,
        imports: atRules.imports,
        mediaQuery: atRules.mediaQuery,
        variables: stats.variables,
        componentStructure: getComponentStructure(fileAST),
        totalDeclarations: stats.totalDeclarations,
        ruleSets: getRuleSets(fileAST),
        stats: stats.stats
    };
}

function getStatFor(url, componentPrefix) {
    if (path.extname(url) !== '.scss') {
        return;
    }
    componentPrefixRegExp = componentPrefix;
    return getStatistic(fs.readFileSync(url, 'utf8'));
}

module.exports = {
    getStatFor: getStatFor
};
