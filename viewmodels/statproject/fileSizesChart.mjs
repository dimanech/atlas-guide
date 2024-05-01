function fileSizesChart(data) {
    const dataStr = JSON.stringify(data);

    return `
        <svg class="js-stacked-chart">
            <defs data-chart='${dataStr}'></defs>
        </svg>
        `;
}

export default fileSizesChart;
