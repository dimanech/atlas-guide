function getMetric(item, decl) {
    const regexp = new RegExp('^' + item); // we need to cover several cases - margin, margin-top, margin-start, etc.

    if (regexp.test(decl.prop)) {
        let stat = [];
        const metricList = decl.value.split(' ');
        metricList.forEach(value => stat.push(value));
        return stat;
    } else {
        return null;
    }
}

export default getMetric;
