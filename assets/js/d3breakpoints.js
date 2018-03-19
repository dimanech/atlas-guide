'use strict';

(function () {
    const d3 = window.d3;

    const data = window.breakpointsGraph;

    const margin = {top: 0, right: 0, bottom: 0, left: 0};
    const width = document.querySelector('.atlas-section').offsetWidth;
    const height = 50;

    const scaleX = d3.scaleLinear()
        .domain([0, 1980])
        .range([0, width]);

    const svg = d3.select('#js-atlas-breakpoints-graph');

    svg.attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    const ticks = svg.append('g')
        .attr('transform', 'translate(0, 22.5)')
        .call(d3.axisBottom(scaleX)
            .ticks(1980 / 20));

    ticks.select('.domain')
        .remove();

    ticks.selectAll('text')
        .remove();

    ticks.selectAll('.tick')
        .attr('class', 'atlas-tick-lines');

    const hints = svg.append('g')
        .attr('transform', 'translate(0, 22.5)')
        .call(d3.axisTop(scaleX)
            .tickSize(10)
            .tickFormat(d3.format('.0f'))
            .tickValues([320, 768, 1024, 1440, 1920]));

    hints.select('.domain')
        .remove();

    hints.selectAll('.tick')
        .attr('class', 'atlas-tick-hints');

    const breaks = svg.append('g')
        .attr('transform', 'translate(0, 15)')
        .call(d3.axisBottom(scaleX)
            .tickFormat(d3.format('.0f'))
            .tickSize(20)
            .tickValues(data));

    breaks.select('.domain')
        .remove();

    breaks.selectAll('.tick')
        .attr('class', 'atlas-tick-breaks');
})();
