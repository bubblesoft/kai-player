import { easeQuadInOut, select, Selection } from "d3";

export default class {
    public arcPeriod: number;

    get spinPeriod() {
        return 1 / this.spinSpeed;
    }

    set spinPeriod(spinPeriod: number) {
        this.spinSpeed = 1 / spinPeriod;
    }

    public ghostNum: number;

    get color() {
        return this.pColor;
    }

    set color(color: string) {
        this.pColor = color;
        this.arc.style("stroke", color);
        this.arcGhostTop.style("stroke", color);
        this.arcGhostBottom.style("stroke", color);
    }

    private spinSpeed = 1;
    private svg: Selection<SVGSVGElement, any, null, undefined>;
    private arc: Selection<SVGPathElement, any, null, undefined>;
    private arcGhostTop: Selection<SVGPathElement, any, null, undefined>;
    private arcGhostBottom: Selection<SVGPathElement, any, null, undefined>;
    private width = 0;
    private height = 0;
    private pColor = "#fff";
    private direction = 1;
    private previousValueAverage = 0;
    private phasesTop: Float32Array = new Float32Array();
    private phasesBottom: Float32Array = new Float32Array();

    constructor(arcPeriod = 30, spinPeriod = 1000, ghostNum = .6) {
        this.arcPeriod = arcPeriod;
        this.spinPeriod = spinPeriod;
        this.ghostNum = ghostNum;

        this.svg = select(document.createElementNS("http://www.w3.org/2000/svg", "svg"))
            .style("opacity", 0);

        this.arc = this.svg.append("path")
            .style("stroke", this.color)
            .style("stroke-width", 3)
            .style("fill", "none");

        this.arcGhostTop = this.svg.append("path")
            .style("stroke", this.color)
            .style("stroke-width", 2)
            .style("fill", "none")
            .style("opacity", 0);

        this.arcGhostBottom = this.svg.append("path")
            .style("stroke", this.color)
            .style("stroke-width", 2)
            .style("fill", "none")
            .style("opacity", 0);
    }

    public mount(root: HTMLElement) {
        this.width = root.offsetWidth || window.innerWidth;
        this.height = root.offsetHeight || window.innerHeight;

        this.svg
            .attr("width", this.width)
            .attr("height", this.height);

        this.svg.each(function() { root.appendChild(this); });
    }

    public draw(data: number[], delta?: number) {
        const twoPI = 2 * Math.PI;

        if (delta) {
            if (this.phasesTop.length === data.length) {
                this.phasesTop = this.phasesTop.map((phase) => {
                    phase -= this.spinSpeed * 1.2 * delta;

                    if (phase < 0) {
                        phase = phase % 1 + 1;
                    }

                    return phase;
                });

                this.phasesBottom = this.phasesBottom.map((phase) => {
                    phase += this.spinSpeed * .8 * delta;

                    if (phase >= 1) {
                        phase = phase % 1;
                    }

                    return phase;
                });
            } else {
                const width = data.length - 1;
                const phaseData = data.map((val, index) => index / width);

                this.phasesTop = new Float32Array(phaseData);
                this.phasesBottom = new Float32Array(phaseData);
            }
        } else {
            this.phasesTop = new Float32Array();
        }

        if (data.length) {
            const space = this.width / (data.length);
            const halfDataLength = data.length / 2;
            const average = data.reduce((total, val) => total + val) / data.length;

            const getPath = (coordinates: Array<{ x: number, y: number }>, scale: number) => {
                const halfHeight = this.height / 2;

                let d = "M0 " + halfHeight + "C0 " + halfHeight + ",";

                coordinates.forEach(({ x, y }, index) => {
                    const controlPointX = index < coordinates.length - 1 ? x + (x - coordinates[index + 1].x) * .3 : x;
                    const controlPointY = index < coordinates.length - 1 ? y + (y - coordinates[index + 1].y) * .3 : y;

                    d += `${controlPointX} ${(halfHeight + (controlPointY - halfHeight) * scale)},
                        ${x} ${halfHeight + (y - halfHeight) * scale}`;

                    if (index !== coordinates.length - 1) {
                        d += "S";
                    }
                });

                return d;
            };

            const points = data.map((val, index) => {
                const x = space * (index + 1);
                const phases = this.direction === 1 ? this.phasesTop : this.phasesBottom;
                const alpha = phases[index] ? Math.sin(phases[index] * twoPI) : 1;

                const y = this.height / 2 * (1 + (val * .35 + average * .65)
                    * Math.sin((halfDataLength - Math.abs((index + 1) - halfDataLength)) / halfDataLength * Math.PI / 2)
                    * this.direction * .4 * alpha);

                return { x, y };
            });

            this.arc
                .transition()
                .duration(this.arcPeriod)
                .ease(easeQuadInOut)
                .attr("d", () => getPath(points, 1));

            if (Math.random() > this.ghostNum) {
                const timeout = Math.random();

                setTimeout(() => {
                    this.svg.append("path")
                        .style("stroke", this.color)
                        .style("stroke-width", 2)
                        .style("fill", "none")
                        .attr("d", getPath(points, timeout))
                        .transition()
                        .duration(1200)
                        .ease(easeQuadInOut)
                        .style("opacity", 0)
                        .remove();
                }, this.arcPeriod * (.5 + timeout * .5));
            }

            if (average > this.previousValueAverage) {
                setTimeout(() => {
                    const arc = this.direction === 1 ? this.arcGhostTop : this.arcGhostBottom;

                    arc
                        .transition()
                        .duration(this.arcPeriod * (average - this.previousValueAverage) / average)
                        .ease(easeQuadInOut)
                        .attr("d", () => getPath(points, 1))
                        .duration(this.arcPeriod * (average - this.previousValueAverage) / average)
                        .ease(easeQuadInOut)
                        .style("opacity", 1)
                        .transition()
                        .duration(800)
                        .ease(easeQuadInOut)
                        .style("opacity", 0)
                        .on("end", () => {
                            arc.attr("d", () =>
                                getPath(points.map(() => ({ x: this.height / 2, y: this.height / 2 })), 1));
                            this.previousValueAverage = 0;
                        });

                    this.previousValueAverage = average;
                }, this.arcPeriod);
            }

            this.direction *= -1;
        }
    }

    public show() {
        return new Promise((resolve) => {
            this.svg.transition()
                .duration(600)
                .ease(easeQuadInOut)
                .style("opacity", 1)
                .on("end", resolve);
        });
    }

    public hide() {
        return new Promise((resolve) => {
            this.svg.transition()
                .duration(600)
                .ease( easeQuadInOut)
                .style("opacity", 0)
                .on("end", resolve);
        });
    }
}
