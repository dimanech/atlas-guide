'use strict';

(function () {
    const d3 = window.d3;
    const height = 2000;
    const width = 2000;

    const rawdata = window.importsPaths;
    const maxSize = d3.max(Object.keys(rawdata).map(d => rawdata[d].size));

    const z = d3.scaleOrdinal()
        .range(['#8bc34a', '#ffc107', '#307fe2']);
    const fileSize = d3.scaleLinear()
        .domain([0, maxSize])
        .range([0, 150]);

    function radialPoint(x, y) {
        return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
    }

    function rotateText(d) {
        if (d.children) {
            return 0;
        } else {
            return (d.x < Math.PI ? (d.x - Math.PI / 2) : (d.x + Math.PI / 2)) * (180 / Math.PI);
            // return (d.x < Math.PI ? (d.x - Math.PI / 2) : (d.x + Math.PI / 2)) * (180 / Math.PI) / 10;
            // return d.x < Math.PI ? (d.x - Math.PI / 2) * (90 / Math.PI) : (d.x + Math.PI / 2) * (180 / Math.PI);
        }
    }

    function markFileSize(d) {
        const fileWeight = fileSize(rawdata[d.id].size);
        let radius = 0;

        if (d.children) {
            radius = fileWeight;
        } else {
            radius = fileWeight;
        }

        if (d.depth === 0) {
            radius = 0;
        }

        return radius;
    }

    const data = d3.stratify()
        .id(d => d)
        .parentId(d => d.substring(0, d.lastIndexOf('/')))(Object.keys(rawdata))
        .sort((a, b) => (a.height - b.height) || a.id.localeCompare(b.id));

    d3.tree()
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)
        .size([2 * Math.PI, 500])(data);

    // data.descendants().forEach(d => d.y = d.depth === 1 ? 200 : 200 + (d.depth * 150)); // normalize levels
    data.descendants().forEach(d => d.y = 150 * d.depth); // normalize levels

    const svg = d3.select('#js-graph-svg')
        .attr('width', width)
        .attr('height', height);

    const inner = svg.append('g')
        .attr('transform', 'translate(' + (width / 2 + 40) + ',' + (height / 2 + 90) + ')');

    inner.selectAll('.link')
        .data(data.descendants().slice(1))
        .enter().append('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', 'rgba(0, 0, 0, 0.5)')
        .attr('stroke-width', 0.5)
        .attr('d', d => 'M' + radialPoint(d.x, d.y) + 'L' + radialPoint(d.parent.x, d.parent.y));

    const size = inner.selectAll('.size')
        .data(data.descendants())
        .enter().append('g')
        .attr('transform', d => 'translate(' + radialPoint(d.x, d.y) + ')');

    size.append('circle')
        .attr('fill', d => z(rawdata[d.id].size))
        .style('opacity', '0.5')
        .attr('r', d => markFileSize(d));

    const node = inner.selectAll('.node')
        .data(data.descendants())
        .enter().append('g')
        .attr('class', d => 'atlas-node' + (d.children ? ' _internal' : ' _leaf') + ' _' + d.depth) // but not 1 level
        .attr('transform', d => 'translate(' + radialPoint(d.x, d.y) + ')');

    node.append('circle')
        .attr('fill', d => d.depth === 0 ? 'white' : 'black')
        .attr('r', d => d.depth === 0 ? 110 : 2);

    node.append('text')
        .attr('dy', 3)
        .attr('x', d => d.x < Math.PI === !d.children ? 6 : -6)
        .attr('text-anchor', d => d.x < Math.PI === !d.children ? 'start' : 'end')
        .attr('transform', d => 'rotate(' + rotateText(d) + ')')
        .text(d => d.id.substring(d.id.lastIndexOf('/') + 1));
})();
