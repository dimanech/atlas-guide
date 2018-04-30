'use strict';

function getTopMostProperties(fileAST) {
    let allProps = [];
    let redusedProps = {};
    let result = [];

    fileAST.walkDecls(decl => allProps.push(decl.prop));

    allProps.forEach(function(x) {
        redusedProps[x] = (redusedProps[x] || 0) + 1;
    });

    Object.keys(redusedProps).map(item => result.push({
        name: item,
        total: redusedProps[item]
    }));

    result.sort((a, b) => b.total - a.total);

    if (result.length > 9) {
        result = result.slice(0, 9);
    }

    return result;
}

module.exports = getTopMostProperties;
