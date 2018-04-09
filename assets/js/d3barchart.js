'use strict';

(function() {
    function BarChart(rawNode) {
        this.instance = rawNode;
        this.chartData = undefined;
        this.getData();
        this.initChart();
    }

    BarChart.prototype.getData = function() {
        this.chartData = JSON.parse(
            this.instance.querySelector('defs').getAttribute('data-chart')
        );
    };

    BarChart.prototype.initChart = function() {
        const d3 = window.d3;
        const margin = {top: 30, right: 0, bottom: 20, left: 20};
        const width = 140;
        const height = 240;
        const svg = d3.select(this.instance);

        const data = this.chartData;
        const max = data.max;

        const scaleX = d3.scaleBand()
            .domain(data.data.map((d, i) => i))
            .range([0, width])
            .paddingInner(0.05)
            .align(0.1);

        const scaleY = d3.scaleLinear()
            .domain([0, max])
            .range([height, 0]);

        const fillScale = d3.scaleOrdinal()
            .range(['#a7c6ed', '#307fe2']);

        // DOM
        svg.attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        // Axis
        svg.append('g')
            .call(d3.axisLeft(scaleY)
                .ticks(3)
                .tickFormat('')
                .tickSize(-width * 2, 0, 0))
            .attr('transform', 'translate(' + 0 + ',' + margin.top + ')')
            .select('.domain')
            .remove();

        // Beans
        const inner = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        const bar = inner.selectAll('bins')
            .data(data.data)
            .enter()
            .append('g')
            .attr('class', 'bar')
            .attr('transform', (d, i) => 'translate(' + scaleX(i) + ',' + scaleY(data.data[i].val) + ')');

        bar.append('rect')
            .attr('x', 1)
            .attr('fill', (d, i) => fillScale(i))
            .attr('width', scaleX.bandwidth())
            .attr('height', (d, i) => height - scaleY(data.data[i].val));

        bar.append('text')
            .attr('y', -10)
            .attr('x', scaleX.bandwidth() / 2)
            .attr('class', 'bar-caption')
            .attr('text-anchor', 'middle')
            .text((d, i) => data.data[i].val);

        bar.append('text')
            .attr('y', (d, i) => height - scaleY(data.data[i].val))
            .attr('dy', 14)
            .attr('x', scaleX.bandwidth() / 2)
            .attr('class', 'bar-caption-bottom')
            .attr('text-anchor', 'middle')
            .text((d, i) => data.data[i].name);
    };

    document.querySelectorAll('.js-bar-chart').forEach(item => {
        new BarChart(item);
    });
}());
