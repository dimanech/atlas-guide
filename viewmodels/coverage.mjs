import d3scale from 'd3-scale';
import d3fmt from 'd3-format';

const coverageFunction = (coverage) => {
    const scale = d3scale.scaleLinear()
        .domain([0, coverage.all])
        .range([0, 500]);

    const coveredPercent = coverage.covered / coverage.all * 100;

    return {
        'coveredPercent': d3fmt.format('.1f')(coveredPercent),
        'all': coverage.all,
        'covered': coverage.covered,
        'graph': {
            'all': scale(coverage.all),
            'covered': scale(coverage.covered)
        }
    };
};

export default coverageFunction;
