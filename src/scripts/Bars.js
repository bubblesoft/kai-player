/**
 * Created by qhyang on 2017/12/15.
 */

import * as d3 from 'd3';

export default class Bars {
    _svg;
    _width;
    _height;

    init(root, barNum) {
        const margin = 20,
            width = root.offsetWidth,
            height = root.offsetHeight;

        this._svg = d3.select(root).append('svg')
            .attr('width', width - margin)
            .attr('height', height - margin);

        this._width = width - margin * 2;
        this._height = height - margin * 2;

        const wrap = this._svg
            .append('g')
            .attr('transform', 'translate(' + margin + ', ' + margin + ')');

        const barWidth = this._width / barNum,
            barPadding = .5;

        for (let i = 0; i < barNum; i++) {
            wrap
                .append('g')
                .attr('transform', 'translate(' + barWidth * i + ', 0)')
                .append('rect')
                .attr('transform', 'translate(' + barPadding + ', 0)')
                .attr('class', 'bar')
                .attr('width', barWidth - barPadding * 2)
                .attr('fill', 'rgba(186,218,233,.5)');
        }
    }

    draw(data) {
        this._svg.selectAll('.bar')
            .data(data)
            .attr('y', d => {
                return this._height * (1 - d) - 1;
            })
            .attr('height', d => {
                return this._height * d + 1;
            });
    }

    reset() {
        this._svg.selectAll('.bar').transition()
            .duration(200)
            .attrTween('y', d3.easeQuadOut)
            .attrTween('height', d3.easeQuadOut)
            .attr('y', this._height)
            .attr('height', 1);
    }
}