'use strict';

(function () {
    function LineChart(rawNode) {
        this.instance = rawNode;
        this.chartData = undefined;
        this.getData();
        this.initChart();
    }

    LineChart.prototype.getData = function () {
        this.chartData = [
            {
                'prop': 'padding',
                'val': 3
            },
            {
                'prop': 'display',
                'val': 3
            },
            {
                'prop': 'position',
                'val': 4
            },
            {
                'prop': 'width',
                'val': 5
            },
            {
                'prop': 'height',
                'val': 3
            },
            {
                'prop': 'margin',
                'val': 8
            },
            {
                'prop': 'scale',
                'val': 0
            },
            {
                'prop': 'font',
                'val': 0
            },
            {
                'prop': 'bgr-nd',
                'val': 2
            },
            {
                'prop': 'color',
                'val': 0
            }
        ];
    };

    LineChart.prototype.initChart = function () {
        const d3 = window.d3;
        const margin = 10;
        const width = 250;
        const height = 250;
        const svg = d3.select(this.instance);
        const data = this.chartData;
        data.push(data[0]); // close the circle

        const innerRadius = 5;
        const outerRadius = (height / 2) - (margin * 2);

        const dataArray = data.map(d => d.val).sort();
        const max = d3.max(dataArray); // < 4 ? 4 : d3.max(dataValues)

        const angle = d3.scaleLinear()
            .domain([0, dataArray.length - 1])
            .range([0, Math.PI * 2]);

        const radius = d3.scaleLinear()
            .domain([0, max])
            .range([innerRadius, outerRadius]);

        const area = d3.areaRadial()
        // .curve(d3.curveCatmullRomClosed)
            .angle((d, i) => angle(i))
            .innerRadius(0)
            .outerRadius(d => radius(d.val));

        const line = d3.lineRadial()
            .angle((d, i) => angle(i))
            .radius(radius(max));

        const linesecond = d3.lineRadial()
            .angle((d, i) => angle(i))
            .radius(radius(max / 2));

        const linethird = d3.lineRadial()
            .angle((d, i) => angle(i))
            .radius(radius(0.75 * max));

        svg
            .attr('width', width + (margin * 2))
            .attr('height', height + (margin * 2));

        const inner = svg.append('g')
            .attr('transform', 'translate(' +
                (width / 2) + ',' +
                (height / 2) + ')');

        inner.selectAll('.axis')
            .data(d3.range(angle.domain()[1]))
            .enter().append('g')
            .attr('class', 'axis')
            .attr('transform', d => 'rotate(' + angle(d) * (180 / Math.PI) + ')')
            //     .call(d3.axisLeft(radius))
            //     .select('.domain')
            //     .attr('stroke', 'rgba(0,0,0,0.03)');
            .append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', radius(max))
            .attr('stroke', 'rgba(0,0,0,0.03)');
        inner.selectAll('.axis')
            .data(data)
            .append('text')
            .attr('y', -outerRadius - 10)
            .attr('dy', '.5em')
            .attr('fill', 'rgba(0,0,0,0.4)')
            .attr('font-size', '10px')
            .attr('text-anchor', 'middle')
            .text(d => d.prop);
        inner.append('path')
            .data([data])
            .attr('stroke', 'rgba(0,0,0,0.03)')
            .attr('fill', 'none')
            .attr('class', 'line')
            .attr('d', line);
        inner.append('path')
            .data([data])
            .attr('stroke', 'rgba(0,0,0,0.03)')
            .attr('fill', 'none')
            .attr('class', 'line')
            .attr('d', linesecond);
        inner.append('path')
            .data([data])
            .attr('stroke', 'rgba(0,0,0,0.03)')
            .attr('fill', 'none')
            .attr('class', 'line')
            .attr('d', linethird);

        inner.append('g')
            .attr('transform', 'translate(3, 3)')
            .append('path')
            .data([data])
            .attr('fill', 'rgba(0, 0, 0, 0.3)')
            .attr('filter', 'url(#blur-filter)')
            .attr('class', 'area')
            .attr('d', area);
        inner.append('rect')
            .attr('x', '-' + width / 2)
            .attr('y', '-' + height / 2)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'url(#atlas-graph-gradient)')
            .attr('clip-path', 'url(#radar-area)');
        inner.append('clipPath')
            .attr('id', 'radar-area')
            .append('path')
            .data([data])
            .attr('d', area);
    };

    document.querySelectorAll('#b-component-stat-profile').forEach(
        item => new LineChart(item)
    );
}());
