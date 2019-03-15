'use strict';

function getTopMostProperties(fileAST) {
    let allProps = [];
    let reducedProps = {};
    let result = [];

    fileAST.walkDecls(decl => allProps.push(decl.prop));

    allProps.forEach(function(x) {
        reducedProps[x] = (reducedProps[x] || 0) + 1;
    });

    Object.keys(reducedProps).map(item => result.push({
        name: item,
        total: reducedProps[item]
    }));

    result.sort((a, b) => b.total - a.total);

    if (result.length > 9) {
        result = result.slice(0, 9);
    }

    return result;
}

module.exports = getTopMostProperties;
