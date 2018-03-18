'use strict';

const fs = require('fs');
const path = require('path');

const color = require('d3-color');
const postcss = require('postcss');
const postscss = require('postcss-scss');

let componentPrefixRegExp;
// check invalid scss handling

function guessType(name) {
    // parse prefix
    if (/^include/.test(name)) {
        return 'mixin';
    }

    if (/(^media)|(^supports)|(^if)/.test(name)) {
        return 'condition';
    }

    // parse suffixes
    if (/([a-z]_[a-z\d]*$)|(--.*$)/.test(name)) {
        return 'modifier';
    }

    if (/__.*$/.test(name)) {
        return 'element';
    }

    if (/::.*$/.test(name)) {
        return 'element-implicit';
    }

    if (/:.*$/.test(name)) {
        return 'modifier-implicit';
    }

    // parse prefix again
    if (/ &/.test(name)) {
        return 'modifier-context';
    }

    if (/^&/.test(name)) {
        return 'modifier-adjacent';
    }

    if (componentPrefixRegExp.test(name)) {
        // if no prefix defined we should mark first level selectors as component.
        // isRootImmediateChild arg could be used
        return 'component';
    }

    // implement me - orphan element (element from another component or element without root)
    // context modification from another component - this should be warn

    return 'element';
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

function getDeclsStats(fileAST) {
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

    fileAST.walkDecls(decl => {
        if (decl.parent.selector !== undefined && /^\d/.test(decl.parent.selector)) {
            // ignore animation declaration blocks
            return;
        }

        totalDeclarations++;

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

        if (decl.prop === 'float') {
            stats['float'].push(decl.value);
        }

        // Useful

        if (/(^\$|^--)/.test(decl.prop)) {
            variables.push({
                prop: decl.prop,
                value: decl.value
            });
        }

        if (decl.prop === 'z-index') {
            stats.zIndex.push(decl.value);
        }

        // Profile

        if (decl.prop === 'width') {
            stats.width.push(decl.value);
        }

        if (decl.prop === 'height') {
            stats.height.push(decl.value);
        }

        if (/^margin/.test(decl.prop)) {
            const metricList = decl.value.split(' ');
            // declared spaces stat could be here
            metricList.forEach(value => stats.margin.push(value));
        }

        if (/^padding/.test(decl.prop)) {
            const metricList = decl.value.split(' ');
            metricList.forEach(value => stats.padding.push(value));
        }

        if (decl.prop === 'position') {
            stats.position.push(decl.value);
        }

        if (decl.prop === 'display') { // positioning display. Probability of block, i-b usage in components?
            if (/(flex|grid)/.test(decl.value)) {
                stats.display.push(decl.value);
            }
        }

        if (decl.prop === 'color') {
            stats.color.push(decl.value); // size + value if vars is used
        }

        if (decl.prop === 'background-color') {
            stats.backgroundColor.push(decl.value);
        }

        if (decl.prop === 'background') {
            const finalLayer = decl.value.split(',');
            const layerProps = finalLayer.pop().split(' ');
            layerProps.forEach(prop => {
                if (color.hsl(prop).displayable() || /(^\$|^--)/.test(prop)) {
                    stats.backgroundColor.push(prop);
                }
            });
        }

        if (decl.prop === 'font-family') {
            stats.fontFamily.push(decl.value);
        }

        if (decl.prop === 'font-size') {
            stats.fontSize.push(decl.value);
        }

        if (decl.prop === 'font') {
            const declList = decl.value
                .replace(/ ,/g, ',')
                .replace(/ \/ ?/g, '/')
                .split(' ');
            const fontFamily = declList.pop(); // mandatory. always last in list
            const fontSize = declList.pop().split('/'); // mandatory. before family. optional list
            stats.fontSize.push(fontSize[0]);
            stats.fontFamily.push(fontFamily);
        }

        if (decl.prop === 'box-shadow') {
            stats.boxShadow.push(decl.value);
        }
    });

    return {
        stats: stats,
        totalDeclarations: totalDeclarations,
        variables: variables
    };
}

function getStatistic(file) {
    const fileAST = postcss().process(file, {parser: postscss}).root;
    const stats = getDeclsStats(fileAST);
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
