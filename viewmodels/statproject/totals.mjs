import { formatNumbers } from '../utils/format.mjs';

const totals = (stats) => {
    if (!stats) {
        return false;
    }

    return {
        rules: formatNumbers(stats.rules.total),
        selectors: formatNumbers(stats.selectors.total),
        declarations: formatNumbers(stats.declarations.total),
        properties: formatNumbers(Object.keys(stats.declarations.properties).length)
    };
};

export default totals;
