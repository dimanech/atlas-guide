'use strict';

(function () {
    const d3 = window.d3;

    const data = window.importsData;

    const margin = {top: 0, right: 0, bottom: 0, left: 0};
    const width = document.querySelector('.atlas-section').offsetWidth;
    const height = 800;
    const nodeRadius = 17;

    const simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.links).id(d => d.id).distance(40).strength(0.1))
        .force('charge', d3.forceManyBody().strength(-60))
        .force('center', d3.forceCenter(width / 2, height / 2));

    const sizeScale = d3.scaleOrdinal()
        .domain([0, 5, 10])
        .range([4, 4.5, 5]);

    const svg = d3.select('#js-cross-dependencies-graph');

    svg.attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    const inner = svg.append('g');

    const link = inner.selectAll('.link')
        .data(data.links)
        .enter().append('path')
        .style('stroke-width', '0.5')
        .attr('class', 'link');

    const node = inner.selectAll('node')
        .data(data.nodes)
        .enter().append('g')
        .attr('class', 'node');

    node
        .append('circle')
        .attr('r', d => d.depth === 1 ? sizeScale(d.mass) : 2)
        .attr('class', 'node__circle');

    const nodeText = node
        .append('text')
        .text(d => d.id)
        .attr('class', d => d.depth === 1 ? 'node__text _standalone' : 'node__text _partial')
        .style('display', d => d.depth === 1 ? 'block' : 'none');

    simulation.on('tick', function () {
        node.each(d => {
            //const w = 300 * (1 + d.depth);
            //d.x -= (0.2 * (d.x - w));
            d.x = Math.max(nodeRadius, Math.min(width - nodeRadius, d.x));
            d.y = Math.max(nodeRadius, Math.min(height - nodeRadius, d.y));
        });

        link
            .attr('d', d => 'M' + d.source.x + ',' + d.source.y +
                ' ' + d.target.x + ',' + d.target.y);

        node
            .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

        nodeText
            .attr('dx', d => (d.x > width / 2) ? -5 : 5)
            .attr('dy', d => (d.y > height * 0.2) ? -5 : 5)
            .attr('text-anchor', d => (d.x > width / 2) ? 'end' : 'start');
    });

    // Drag
    function dragStarted(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragging(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragEnded(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
    }

    node.call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragging)
        .on('end', dragEnded));

    // Tooltip
    node.selectAll('circle')
        .on('mouseover', function () {
            d3.select(this.parentNode)
                .select('text')
                .style('display', 'block');
        })
        .on('mouseout', function () {
            d3.select(this.parentNode)
                .select('text')
                .style('display', d => d.depth === 1 ? 'block' : 'none');
        });
}());
