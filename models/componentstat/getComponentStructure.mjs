import guessSelectorType from './utils/guessSelectorType.mjs';

function getComponentStructure(fileAST, componentPrefixRegExp) {
    const componentPrefix = componentPrefixRegExp;
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
                const componentType = guessSelectorType(nodeSelector, componentPrefix);
                structure.push({
                    'node': nodeSelector,
                    // 'annotation': isAnnotated ? node.nodes[0].text : '',
                    'type': componentType,
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

export default getComponentStructure;
