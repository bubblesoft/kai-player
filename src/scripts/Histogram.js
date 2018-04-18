/**
 * Created by qhyang on 2017/12/15.
 */

import { select, scaleLinear, easeQuadOut, easeQuadInOut, axisBottom, axisRight } from 'd3';

export default class Histogram {
    _svg;
    _width;
    _height;

    init(root, barNum, groupNum) {
        groupNum = groupNum || 1;

        const margins = {
                left: 50,
                top: 50,
                right: 50,
                bottom: 50
            },
            width = root.offsetWidth || window.innerWidth,
            height = root.offsetHeight || window.innerHeight;

        this._svg = select(root).append('svg')
            .attr('width', width - margins.right / 2)
            .attr('height', height - margins.bottom / 2)
            .style('opacity', 0);

        this._width = width - margins.left - margins.right;
        this._height = height - margins.top - margins.bottom;

        const wrap = this._svg
            .append('g')
            .attr('transform', 'translate(' + margins.left + ', ' + margins.top + ')');

        const barWidth = this._width / barNum,
            barPadding = .5;

        for (let i = 0; i < barNum; i++) {
            const barWrap = wrap
                .append('g')
                .attr('transform', 'translate(' + barWidth * i + ', 0)'),
                colors = ['rgba(168,168,168,.5)', 'rgba(186,218,233,.5)'];

            for (let i = 0; i < groupNum; i++) {
                barWrap
                    .append('rect')
                    .attr('transform', 'translate(' + barPadding + ', 0)')
                    .attr('class', 'bar bar-' + i)
                    .attr('width', barWidth - barPadding * 2)
                    .attr('fill', colors[i]);
            }
        }


        // Axises

        const scaleX = scaleLinear()
            .domain([20, 20000])
            .range([0, this._width]);

        const axisX = axisBottom(scaleX);

        axisX.ticks(barNum / 2);

        this._svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margins.left + ', ' + (margins.top + this._height) + ')')
            .call(axisX);

        const scaleY = scaleLinear()
            .domain([0, -60])
            .range([0, this._height]);

        const axisY = axisRight(scaleY);

        axisY.ticks(Math.ceil(this._height / 100));

        this._svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + (margins.left + this._width) + ', ' + margins.top + ')')
            .call(axisY);

    }

    draw(data, groupIndex) {
        this._svg.selectAll('.bar-' + groupIndex)
            .data(data)
            .attr('y', d => {
                return this._height * (1 - d);
            })
            .attr('height', d => {
                return this._height * d;
            });
    }

    reset() {
        this._svg.selectAll('.bar').transition()
            .duration(200)
            .attrTween('y', easeQuadOut)
            .attrTween('height', easeQuadOut)
            .attr('y', this._height)
            .attr('height', 0);
    }

    show() {
        this._svg.transition()
            .duration(600)
            .styleTween('opacity', easeQuadInOut)
            .style('opacity', 1);
    }

    hide() {
        this._svg.transition()
            .duration(600)
            .styleTween('opacity', easeQuadInOut)
            .style('opacity', 0);
    }
}