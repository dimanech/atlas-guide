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

export default getAtRules;
