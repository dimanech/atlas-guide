'use strict';

const fs = require('fs');
const postcss = require('postcss');
const scss = require('postcss-scss');
const mustache = require('mustache');
const sass = require('node-sass');

function getConstantsList(url, constantsList) {
    const file = fs.readFileSync(url, 'utf8');
    const fileAST = postcss().process(file, {parser: scss}).root;

    let rawConstants = [];

    fileAST.walkDecls(decl => {
        constantsList.forEach(constant => {
            if (constant.regex.test(decl.prop)) {
                rawConstants.push({
                    'constName': decl.prop,
                    'constNameSafe': '\\' + decl.prop
                });
            }
        });
    });

    return {
        rawConstants: rawConstants,
        fileString: file
    };
}

function compileStyles(constants) {
    const template = '{{>constants}} {{#content}} {{constNameSafe}} { color: {{constName}} } {{/content}}';
    const styles = sass.renderSync({
        data: mustache.render(template, {content: constants.rawConstants}, {constants: constants.fileString})
    });
    return styles.css.toString();
}

function getProjectConstants(constConfig) {
    if (!constConfig.isDefined) {
        return undefined;
    }
    const constSrc = constConfig.constantsSrc;
    const constList = constConfig.constantsList;

    const compiledConstants = compileStyles(getConstantsList(constSrc, constList));
    const fileAST = postcss().process(compiledConstants).root;

    let rawConstants = {
        'color': [],
        'font': [],
        'scale': [],
        'space': [],
        'breakpoint': [],
        'depth': [],
        'motion': []
    };

    fileAST.walkRules(rule => {
        constList.forEach(constant => {
            if (constant.regex.test(rule.selector)) {
                const value = rule.nodes[0].value;
                rawConstants[constant.name].push({
                    'name': rule.selector.replace(/\\/, ''),
                    'value': value,
                    'valueUnitless': value.replace(/[a-z]/g, '')
                });
            }
        });
    });

    return rawConstants;
}

// fs.writeFileSync('const.json', JSON.stringify(
//     getProjectConstants(require('./atlasconfig.js').getConstants().projectConstants), null, '\t'));

module.exports = getProjectConstants;
