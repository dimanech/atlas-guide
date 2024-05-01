import _uniq from 'lodash.uniq';

const parseSpaces = (spacesArray) => {
    if (!spacesArray) {
        return false;
    }

    let allMargins = [];

    spacesArray.forEach(declarationVal => {
        if (/calc/ig.test(declarationVal)) {
            return allMargins.push(declarationVal);
        }
        declarationVal.trim().split(/\s/).forEach(value => allMargins.push(value));
    });

    return _uniq(allMargins);
}

export default parseSpaces;
