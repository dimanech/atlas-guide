import { scaleLinear } from 'd3-scale';

const prepareComponentsFileSizesStat = (sizeStats) => {
    sizeStats.sort((a, b) => b.size - a.size);

    const max = sizeStats[0].size;
    const scale = scaleLinear()
        .domain([0, max])
        .range([0, 400]);

    sizeStats.forEach(item => {
        const circleSize = scale(item.size);
        item.svg = {
            radius: circleSize / 2,
            size: circleSize
        };
    });

    return sizeStats;
};

export default prepareComponentsFileSizesStat;
