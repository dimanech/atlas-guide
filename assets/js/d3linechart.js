'use strict';

(function() {
    // chat scroll + rounded line
    // animation

    function LineChart(rawNode) {
        this.instance = rawNode;
        this.chartData = undefined;
        this.getData();
        this.initChart();
    }

    LineChart.prototype.getData = function () {
        const unifyData = function (data) {
            let unifData = [];

            if (data[0].declarations !== undefined) {
                data.forEach(item => {
                    unifData.push({
                        specificity: item.declarations,
                        selector: item.selector
                    });
                });
            } else {
                unifData = data;
            }

            return unifData;
        };

        let data = this.instance.querySelector('defs').getAttribute('data-chart');

        try {
            data = JSON.parse(data);
            if (data.length) {
                data = unifyData(data);
            } else {
                return;
            }
        } catch (e) {
            console.log(e);
        }

        this.chartData = data;
    };

    LineChart.prototype.initChart = function() {
        const d3 = window.d3;
        const margin = {top: 20, right: 0, bottom: 10, left: 20};
        const width = document.querySelector('.atlas-stat-sheet').offsetWidth;
        const height = 400;
        const svg = d3.select(this.instance);
        const data = this.chartData;

        if (!data) {
            return;
        }

        // Cache basic statistics
        const dataArray = data.map(d => d.specificity).sort();
        const max = d3.max(dataArray);
        const mean = d3.mean(dataArray);
        //const iqtl = d3.quantile(dataArray, 0.25);
        //const iiiqtl = d3.quantile(dataArray, 0.75);

        const scaleX = d3.scaleLinear()
            .domain([0, data.length])
            .range([0, width]);

        const scaleY = d3.scaleLinear()
            .domain([0, max])
            .range([height, 0]);

        const area = d3.area()
            .x((d, i) => scaleX(i))
            .y0(height)
            .y1(d => scaleY(d.specificity));

        const line = d3.line()
            .x((d, i) => scaleX(i))
            .y(d => scaleY(d.specificity));

        // DOM
        svg.attr('viewBox', '0 0 ' +
            (width + margin.left + margin.right) + ' ' +
            (height + margin.top + margin.bottom));

        const inner = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Axis
        inner.append('g')
            .call(d3.axisLeft(scaleY)
                .ticks(3)
                .tickValues([0, 10, 20, 30, 100, mean, max])
                .tickSize(-width, 0, 0))
            .select('.domain')
            .remove();

        inner.selectAll('g.tick')
            .filter(d => d === mean)
            .attr('class', 'tick mean');

        inner.append('path')
            .data([data])
            .attr('fill', 'grey')
            .attr('stroke', 'steelblue')
            .attr('class', 'area')
            .attr('d', area);

        inner.append('path')
            .data([data])
            .attr('fill', 'none')
            .attr('class', 'area-line')
            .attr('stroke', 'blue')
            .attr('stroke-width', 1)
            .attr('d', line);

        // Mark huge charts
        if (data.length > 600) {
            inner.select('.area-line').attr('class', 'area-line _huge');
            inner.select('.area').attr('class', 'area _huge');
        }

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
            const itemIndex = Math.round(scaleX.invert(mouseX));

            if (itemIndex > data.length - 1 || itemIndex < 0) {
                return;
            }

            const itemSpecificity = data[itemIndex].specificity;
            const itemSelector = data[itemIndex].selector;

            focus.attr('transform', 'translate(' + scaleX(itemIndex) + ',0)');
            focusInner.attr('transform', 'translate(' + 0 + ',' + scaleY(itemSpecificity) + ')');

            if (mouseX > width * 0.6) {
                focus.select('text')
                    .attr('text-anchor', 'end')
                    .attr('x', 8)
                    .text(itemSpecificity + ' ' + itemSelector);
            } else {
                focus.select('text')
                    .attr('text-anchor', 'start')
                    .attr('x', -8)
                    .text(itemSpecificity + ' ' + itemSelector);
            }
        });
    };

    document.querySelectorAll('.js-line-chart').forEach(
        item => new LineChart(item)
    );
}());
