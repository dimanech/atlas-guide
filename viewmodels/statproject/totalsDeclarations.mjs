function totalsDeclarations(stats) {
    let totals = [];
    const totalProperties = [
        'width',
        'height',
        'position',
        'float',
        'margin',
        'padding',
        'color',
        'background-color'
    ];

    totalProperties.forEach(property => {
        const prop = stats.declarations.properties[property];
        totals.push({
            name: property.replace('-', ' '),
            count: prop ? prop.length : 0
        });
    });

    totals.push({
        name: 'font size',
        count: stats.declarations.getAllFontSizes().length
    });

    return totals;
}

export default totalsDeclarations;
