'use strict';

const fs = require('fs');

// const _uniq = require('lodash.uniq');
const postcss = require('postcss');
const scss = require('postcss-scss');

const declaredConstants = require('./atlasconfig.js').getConstants().projectConstants;

function getProjectConstants(url) {
    const file = fs.readFileSync(url, 'utf8');
    const fileAST = postcss().process(file, {parser: scss}).root;

    let rawConstants = {
        'color': [],
        'font': [],
        'scale': [],
        'space': [],
        'motion': [],
        'depth': [],
        'breakpoint': []
    };

    fileAST.walkDecls(decl => {
        declaredConstants.constantsList.forEach(constant => {
            if (constant.regex.test(decl.prop)) {
                rawConstants[constant.name].push(decl.value);
            }
        });
    });

    return rawConstants;
}

// fs.writeFileSync('const.json', JSON.stringify(getProjectConstants(declaredConstants.constantsSrc), null, '\t'));

module.exports = {
    getStatFor: getProjectConstants
};
