'use strict';

const getPropsStat = require('./getPropsStat');

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
        getPropsStat(decl, stats, variables);
    });









    return {
        stats: stats,
        totalDeclarations: totalDeclarations,
        variables: variables
    };
}

module.exports = getDeclarationsStats;
