'use strict';

const path = require('path');
const postcss = require('postcss');
const scss = require('postcss-scss');
const mustache = require('mustache');
const sass = require('sass');

/**
 * Prepare constants data based on config and declared constants. This will be used to compile CSS
 * with computed SCSS variables.
 * @param {String} fileString scss with constants
 * @param {Object} constantsList constants config
 * @return {{rawConstants: Array, fileString: String}}
 */
function prepareConstantsData(fileString, constantsList) {
    const fileAST = postcss().process(fileString, { parser: scss }).root;

    let rawConstants = [];

    fileAST.walkDecls(decl => {
        constantsList.forEach(constant => {
            if (new RegExp(constant.regex).test(decl.prop) && !/^--/.test(decl.prop)) { // exclude custom properties
                // since we do not need to compile it
                rawConstants.push({
                    'constName': decl.prop,
                    'constNameSafe': '\\' + decl.prop // escape "&" string from selector name
                });
            }
        });
    });

    return {
        rawConstants: rawConstants,
        fileString: fileString
    };
}

/**
 * Generate CSS file with all compiled SCSS variables filled into `constNameSafe { color: constName }`
 * that will be parsed later to get all variables and values list.
 * @param {Object} constantsData
 * @param {Array} additionalSassImports
 * @return {string} compiled CSS file string
 */
function compileStyles(constantsData, additionalSassImports) {
    const template = '{{>constantsFile}} {{#constants}} {{constNameSafe}} { color: {{constName}} } {{/constants}}';
    let cssString = '';

    try {
        const styles = sass.renderSync({
            data: mustache.render(
                template,
                {constants: constantsData.rawConstants},
                {constantsFile: constantsData.fileString}),
            includePaths: additionalSassImports
        });
        cssString = styles.css.toString();
    } catch (error) {
        console.log('Warn: Atlas: Could not compile configuration file. ' +
            'Styleguide page and consistency checks could not be prepared.\n' +
            'Ensure that "scssAdditionalImportsArray" has all additional imports paths.\n', error.formatted);
    }

    return cssString;
}

/**
 * Walk over file and fill out constants arrays with `name, value` objects
 * @param fileAST
 * @param constList
 * @return {{color: Array, font: Array, scale: Array, space: Array, breakpoint: Array, depth: Array, motion: Array}}
 */
function getConstants(fileAST, constList) {
    let constants = {
        'color': [],
        'font': [],
        'scale': [],
        'space': [],
        'breakpoint': [],
        'depth': [],
        'motion': []
        // 'zIndex': []
    };

    fileAST.walkRules(rule => {
        constList.forEach(constant => {
            if (rule.selector === ':root') {
                rule.walkDecls(new RegExp(constant.regex), decl => {
                    constants[constant.name].push({
                        'name': decl.prop,
                        'value': decl.value
                    });
                });
            } else {
                if (new RegExp(constant.regex).test(rule.selector)) {
                    constants[constant.name].push({
                        'name': rule.selector.replace(/\\/, ''),
                        'value': rule.nodes[0].value
                    });
                }
            }
        });
    });

    return constants;
}

function getProjectConstants(constConfig, additionalSassImports) {
    if (!constConfig.isDefined) {
        return undefined;
    }
    const constRegexpsList = constConfig.constantsList;
    const constFileString = constConfig.constantsFile;
    const imports = additionalSassImports || [];
    constConfig.constantsSrc.forEach(item => imports.push(path.dirname(item)));// in case if file itself contain imports

    const compiledConstants = compileStyles(prepareConstantsData(constFileString, constRegexpsList), imports);
    const compiledConstantsAST = postcss().process(compiledConstants, { stringifier: {} }).root;

    return getConstants(compiledConstantsAST, constRegexpsList);
}

module.exports = getProjectConstants;
