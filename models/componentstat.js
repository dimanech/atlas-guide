'use strict';

const fs = require('fs');
const path = require('path');

const color = require('d3-color');
const postcss = require('postcss');
const postscss = require('postcss-scss');
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

    // parse prefix
    if (/ &/.test(name)) {
        return 'modifier-context';
    }

    if (/^&/.test(name)) {
        return 'modifier-adjacent';
    }

    // if nested (namespaced) than this is component. Could be implemented. isRootChild argument
    if (/(^.b-)|(^.l-)/.test(name)) { // TODO: move me to config
        return 'component';
    }

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

function getStatistic(file) {
    const fileAST = postcss().process(file, {parser: postscss}).root;

    let rawStat = {
        includes: [],
        imports: [],
        variables: [],
        componentStructure: getComponentStructure(fileAST),
        totalDeclarations: 0,
        ruleSets: getRuleSets(fileAST),
        stats: {
            'scale': [],
            'font': [],
            'margin': [],
            'padding': [],
            'color': [],
            'background': [],
            'important': [],
            'width': [],
            'height': [],
            'mediaQuery': [],
            'vendorPrefix': [],
            'zIndex': [],
            'position': [],
            'floats': [],
            'display': []
        }
    };

    fileAST.walkAtRules(atrule => { // getAtRules
        if (atrule.name === 'include') {
            rawStat.includes.push(atrule.params);
        }

        if (atrule.name === 'import') {
            rawStat.imports.push(atrule.params);
        }

        if (atrule.name === 'media') {
            rawStat.stats.mediaQuery.push(atrule.params);
        }
    });

    fileAST.walkDecls(decl => { // getDeclsStats
        if (decl.parent.selector !== undefined && /^\d/.test(decl.parent.selector)) {
            // ignore animation declaration blocks
            return;
        }

        rawStat.totalDeclarations++;

        // Health

        if (decl.important) {
            rawStat.stats.important.push({
                prop: decl.prop
            });
        }

        if (/^-/.test(decl.prop)) {
            rawStat.stats.vendorPrefix.push({
                prop: decl.prop,
                value: decl.value
            });
        }

        if (decl.prop === 'float') {
            rawStat.stats.floats.push(decl.value);
        }

        // Useful

        if (/(^\$|^--)/.test(decl.prop)) {
            rawStat.variables.push({
                prop: decl.prop,
                value: decl.value
            });
        }

        if (decl.prop === 'z-index') {
            rawStat.stats.zIndex.push(decl.value);
        }

        // Profile

        if (decl.prop === 'width') {
            rawStat.stats.width.push(decl.value);
        }

        if (decl.prop === 'height') {
            rawStat.stats.height.push(decl.value);
        }

        if (/^margin/.test(decl.prop)) {
            const metricList = decl.value.split(' ');
            // declared spaces stat could be here
            metricList.forEach(value => rawStat.stats.padding.push(value));
        }

        if (/^padding/.test(decl.prop)) {
            const metricList = decl.value.split(' ');
            metricList.forEach(value => rawStat.stats.margin.push(value));
        }

        if (decl.prop === 'position') {
            rawStat.stats.position.push(decl.value);
        }

        if (decl.prop === 'display') { // positioning display. Probability of block, i-b usage in components?
            if (/(flex|grid)/.test(decl.value)) {
                rawStat.stats.display.push(decl.value);
            }
        }

        if (decl.prop === 'color') {
            rawStat.stats.color.push(decl.value); // size + value if vars is used
        }

        if (decl.prop === 'background-color') {
            rawStat.stats.background.push(decl.value);
        }

        if (decl.prop === 'background') {
            const finalLayer = decl.value.split(',');
            const layerProps = finalLayer.pop().split(' ');
            layerProps.forEach(prop => {
                if (color.hsl(prop).displayable() || /(^\$|^--)/.test(prop)) {
                    rawStat.stats.background.push(prop);
                }
            });
        }

        if (decl.prop === 'font-family') {
            rawStat.stats.font.push(decl.value);
        }

        if (decl.prop === 'font-size') {
            rawStat.stats.scale.push(decl.value); // size + value if vars is used
        }

        if (decl.prop === 'font') {
            const declList = decl.value
                .replace(/ ,/g, ',')
                .replace(/ \/ ?/g, '/')
                .split(' ');
            const fontFamily = declList.pop(); // mandatory. always last in list
            const fontSize = declList.pop().split('/'); // mandatory. before family. optional list
            rawStat.stats.scale.push(fontSize[0]);
            rawStat.stats.font.push(fontFamily);
        }
    });

    return rawStat;
}

function getStatFor(url) {
    if (path.extname(url) !== '.scss') {
        return;
    }
    return getStatistic(fs.readFileSync(url, 'utf8'));
}

module.exports = {
    getStatFor: getStatFor
};
