/**
 * Created by qhyang on 2018/4/17.
 */

import { select, easeQuadInOut } from 'd3';

export default class ElectricArc {
    period;
    _svg;
    _arc;
    _arcGhost1;
    _arcGhost2;
    _width;
    _height;
    _color;
    _direction = 1;
    _previousValueAverage = 0;

    constructor(period) {
        this.period = period;
    }

    init(root) {
        this._width = root.offsetWidth || window.innerWidth;
        this._height = root.offsetHeight || window.innerHeight;

        this._svg = select(root).append('svg')
            .attr('width', this._width)
            .attr('height', this._height)
            .style('opacity', 0);

        this._arc = this._svg.append('path')
            .style('stroke', this._color || '#fff')
            .style('stroke-width', 3)
            .style('fill', 'none');

        this._arcGhost1 = this._svg.append('path')
            .style('stroke', this._color || '#fff')
            .style('stroke-width', 2)
            .style('fill', 'none')
            .style('opacity', 0);

        this._arcGhost2 = this._svg.append('path')
            .style('stroke', this._color || '#fff')
            .style('stroke-width', 2)
            .style('fill', 'none')
            .style('opacity', 0);
    }

    draw(data) {
        if (data.length) {
            const space = this._width / (data.length),
                halfDataLength = data.length / 2,
                average = data.reduce((total, val) => {
                    return total + val;
                }) / data.length,
                getPath = (points, scale) => {
                    const halfHeight = this._height / 2;

                    let d = 'M0 ' + halfHeight + 'C0 ' + halfHeight + ',';

                    points.forEach(({ x, y }, index) => {
                        const controlPointX = index !== points.length - 1 ? x + (x - points[index + 1].x) * .3 : x,
                            controlPointY = index !== points.length - 1 ? y + (y - points[index + 1].y) * .3: y;

                        d += controlPointX + ' ' + (halfHeight + (controlPointY - halfHeight) * scale) + ',' + x + ' ' + (halfHeight + (y - halfHeight) * scale);

                        if (index !== points.length - 1) {
                            d += 'S';
                        }
                    });

                    return d;
                };

            const points = data.map((val, index) => {
                const x = space * (index + 1),
                    y = this._height / 2 * (1 + (val * .35 + average * .65) * Math.sin((halfDataLength - Math.abs((index + 1) - halfDataLength)) / halfDataLength * Math.PI / 2) * this._direction * .4);

                return { x, y };
            });

            this._arc
                .datum(points)
                .transition()
                .duration(this.period)
                .attrTween('d', easeQuadInOut)
                .attr('d', d => {
                    return getPath(points, 1);
                });

            const timeout = Math.random();

            setTimeout(() => {
                this._svg.append('path')
                    .style('stroke', this._color || '#fff')
                    .style('stroke-width', 2)
                    .style('fill', 'none')
                    .attr('d', getPath(points, timeout))
                    .transition()
                    .duration(1200)
                    .styleTween('opacity', easeQuadInOut)
                    .style('opacity', 0)
                    .remove();
            }, this.period * (.5 + timeout * .5));

            if (average > this._previousValueAverage) {
                setTimeout(() => {
                    const arc = this._direction === 1 ? this._arcGhost1 : this._arcGhost2;

                    arc
                        .datum(points)
                        .transition()
                        .duration(this.period * (average - this._previousValueAverage) / average)
                        .attrTween('d', easeQuadInOut)
                        .attr('d', () => getPath(points, 1))
                        .duration(this.period * (average - this._previousValueAverage) / average)
                        .styleTween('opacity', easeQuadInOut)
                        .style('opacity', 1)
                        .transition()
                        .duration(800)
                        .styleTween('opacity', easeQuadInOut)
                        .style('opacity', 0)
                        .on('end', () => {
                            arc.attr('d', () => getPath(points.map(() => {
                                return { x: this._height / 2, y: this._height / 2 }
                            }), 1));

                            this._previousValueAverage = 0;
                        });

                    this._previousValueAverage = average;
                }, this.period);
            }

            this._direction *= -1;
        }
    }

    setColor(color) {
        this._color = color;
        this._arc.style('stroke', color);
        this._arcGhost1.style('stroke', color);
        this._arcGhost2.style('stroke', color);
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