import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import scss from 'postcss-scss';
import getComponentStructure from './componentstat/getComponentStructure.mjs';
import getAtRules from './componentstat/getAtRules.mjs';
import getRuleSets from './componentstat/getRuleSets.mjs';
import getPropertiesStats from './componentstat/getPropertiesStats.mjs';
import getTopMostProperties from './componentstat/getTopMostProperties.mjs';

const getStatistic = (file, componentPrefix) => {
    const fileAST = postcss().process(file, {parser: scss}).root;
    const componentPrefixRegExp = componentPrefix;
    const stats = getPropertiesStats(fileAST);
    const atRules = getAtRules(fileAST);

    return {
        includes: atRules.includes,
        imports: atRules.imports,
        mediaQuery: atRules.mediaQuery,
        variables: stats.variables,
        componentStructure: getComponentStructure(fileAST, componentPrefixRegExp),
        totalDeclarations: stats.totalDeclarations,
        ruleSets: getRuleSets(fileAST),
        stats: stats.stats,
        mostProps: getTopMostProperties(fileAST)
    };
};

const getStatFor = (url, componentPrefix) => {
    if (path.extname(url) !== '.scss') {
        return;
    }
    return getStatistic(fs.readFileSync(url, 'utf8'), componentPrefix);
};

export default getStatFor;
