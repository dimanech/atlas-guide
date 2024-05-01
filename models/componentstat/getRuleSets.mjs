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

export default getRuleSets;
