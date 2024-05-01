import { scaleLinear } from 'd3-scale';
import { line, curveCatmullRom } from 'd3-shape';

const ruleSetChart = (dataArr) => {
    const width = 290;
    const height = 64;
    const max = Math.max(...dataArr);
    const scaleX = scaleLinear()
        .domain([0, dataArr.length - 1])
        .range([0, width]);

    const scaleY = scaleLinear()
        .domain([0, max < 5 ? 5 : max])
        .range([height, 0]);

    return line()
        .x((d, i) => scaleX(i))
        .y(d => scaleY(d))
        .curve(curveCatmullRom.alpha(0.5))(dataArr);
};

export default ruleSetChart;
