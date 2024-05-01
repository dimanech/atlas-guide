import { formatNumbers } from '../utils/format.mjs';

const normalizeData = (data, field) => {
    return data.map(item => {
        return {
            selector: item.selector.replace(/'/g, '"'),
            data: item[field]
        };
    });
};

const renderLineChart = (data, type) => {
    const dataStr = JSON.stringify(normalizeData(data, type));

    return `
        <svg class="js-line-chart">
            <defs data-chart='${dataStr}'></defs>
        </svg>
        `;
};

const specificityChart = (stats) => {
    return {
        'chart': renderLineChart(stats.selectors.getSpecificityValues(), 'specificity'),
        'max': stats.selectors.specificity.max,
        'average': formatNumbers(stats.selectors.specificity.average)
    };
};

const ruleSizeChart = (stats) => {
    return {
        'chart': renderLineChart(stats.rules.selectorRuleSizes, 'declarations'),
        'max': stats.rules.size.max,
        'average': formatNumbers(stats.rules.size.average)
    };
};

export { specificityChart, ruleSizeChart };
