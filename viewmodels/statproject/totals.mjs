// import path from 'node:path';
import { formatNumbers } from '../utils/format.mjs'; // path.join(__dirname, '../utils/format')

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
}

export default totals;
