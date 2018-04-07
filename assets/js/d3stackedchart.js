'use strict';

(function() {
    function StackedChart(rawNode) {
        this.instance = rawNode;
        this.chartData = undefined;
        this.getData();
        this.initChart();
    }

    StackedChart.prototype.getData = function() {
        const data = JSON.parse(this.instance.querySelector('defs').getAttribute('data-chart'));
        data.sort((a, b) => b.zipped - a.zipped);

        this.chartData = data;
    };

    StackedChart.prototype.initChart = function() {
        const d3 = window.d3;
        const margin = {top: 20, right: 0, bottom: 150, left: 30};
        const width = (document.querySelector('.atlas-stat-sheet').offsetWidth) - margin.right - margin.left;
        const height = 400;
        const formatBites = d3.format('.2s');
        const svg = d3.select(this.instance);
        const data = this.chartData;

        if (!data) {
            return;
        }

        const max = d3.max(data.map(item => item.raw));
        const mean = d3.mean(data.map(item => item.zipped));

        const x = d3.scaleBand()
            .domain(data.map(item => item.name))
            .rangeRound([0, (data.length * 55) > width ? width : (data.length * 55)])
            .paddingInner(0.05)
            .align(0.05);

        const y = d3.scaleLinear()
            .domain([0, max])
            .range([height, 0])
            .nice();

        const z = d3.scaleOrdinal() // fillScale
            .range(['#307fe2', '#a7c6ed']);

        // Generators
        const sharedStack = d3.stack().keys(['zipped', 'raw'])
            .value((d, key) => key === 'raw' ? (d.raw - d.zipped) : d.zipped);

        // DOM
        svg.attr('viewBox', '0 0 ' +
            (width + margin.left + margin.right) + ' ' +
            (height + margin.top + margin.bottom));
        // Bars
        const inner = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Bars
        const stackedItems = inner.append('g')
            .attr('class', 'inner')
            .selectAll('g')
            .data(sharedStack(data))
            .enter().append('g')
            .attr('fill', d => z(d.key));

        stackedItems.selectAll('rect')
            .data(d => d)
            .enter()
            .append('rect')
            .attr('x', d => x(d.data.name))
            .attr('y', d => y(d[1]))
            .attr('height', d => {
                const height = y(d[0]) - y(d[1]);
                return height < 0 ? 0 : height;
            })
            .attr('width', x.bandwidth());

        //Ticks
        inner.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x))
            .selectAll('.tick').select('text')
            .attr('text-anchor', 'start')
            .attr('dx', 10)
            .attr('transform', 'rotate(45)');

        inner.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y)
                .ticks(4)
                .tickValues([0, 50000, 100000, mean, max])
                .tickFormat(formatBites)
                .tickSize(-width, 0, 0)
            );

        inner.selectAll('.axis')
            .select('.domain')
            .remove();

        inner.selectAll('g.tick')
            .filter(d => d === mean)
            .attr('class', 'tick mean');

        // Legend
        const legend = inner.append('g')
            .attr('class', 'atlas-stat-chart__legend')
            .attr('text-anchor', 'end')
            .attr('transform', 'translate(0,20)')
            .selectAll('g')
            .data(['zipped', 'raw'].slice().reverse()) //keys.slice
            .enter().append('g')
            .attr('transform', (d, i) => 'translate(0,' + i * 22 + ')');

        legend.append('rect')
            .attr('x', width - 19)
            .attr('width', 19)
            .attr('height', 19)
            .attr('fill', z);

        legend.append('text')
            .attr('x', width - 24)
            .attr('y', 9.5)
            .attr('dy', '0.32em')
            .text(d => d);

        // Tooltip
        const focus = inner.append('g')
            .attr('class', 'focus');

        focus.append('rect')
            .attr('width', 1)
            .attr('height', height)
            .attr('style', 'opacity: 0.1')
            .attr('fill', 'black');

        focus.append('text')
            .attr('y', -10);

        const focusInner = focus.append('g')
            .attr('class', 'focus-line');

        focusInner.append('circle')
            .attr('r', 3)
            .attr('fill', 'black');

        svg.on('mousemove', function () {
            const mouseX = d3.mouse(this)[0] - margin.left - margin.right;
            const itemIndex = Math.round((mouseX - margin.left - margin.right) / x.bandwidth());

            if (itemIndex > data.length - 1 || itemIndex < 0) {
                return;
            }

            const itemSizeRaw = formatBites(data[itemIndex].raw);
            const itemSizeZipped = formatBites(data[itemIndex].zipped);

            focus.attr('transform', 'translate(' + (x(data[itemIndex].name) + (x.bandwidth() / 2)) + ',0)');
            focusInner.attr('transform', 'translate(' + 0 + ',' + y(data[itemIndex].zipped) + ')');

            if (mouseX > width * 0.6) {
                focus.select('text')
                    .attr('text-anchor', 'end')
                    .attr('x', 8)
                    .text(itemSizeRaw + '/' + itemSizeZipped);
            } else {
                focus.select('text')
                    .attr('text-anchor', 'start')
                    .attr('x', -8)
                    .text(itemSizeRaw + '/' + itemSizeZipped);
            }
        });
    };

    document.querySelectorAll('.js-stacked-chart').forEach(
        item => new StackedChart(item)
    );
}());
