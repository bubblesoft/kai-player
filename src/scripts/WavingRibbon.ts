import { easeQuadInOut, select, Selection } from "d3";

const RESISTANCE_FACTOR = 0;

const getPath = (coordinates: Array<{ x: number, y: number }>, width: number, height: number) => {
    const halfHeight = height / 2;

    let d = "M0 " + halfHeight + "C0 " + halfHeight + ",";

    coordinates.forEach(({ x, y }, i) => {
        const controlPointX = i < coordinates.length - 1 ? x + (x - coordinates[i + 1].x) * .3 : x;
        const controlPointY = i < coordinates.length - 1 ? y + (y - coordinates[i + 1].y) * .3 : y;

        d += `${controlPointX * width} ${(halfHeight + (controlPointY * halfHeight))},
            ${x * width} ${halfHeight + (y * halfHeight)}S`;

        if (i === coordinates.length - 1) {
            d += `${width} ${halfHeight},${width} ${halfHeight}`;
        }
    });

    return d;
};

export default class {
    public waveSpeed = 1;

    get period() {
        return 1 / this.waveSourceAngularSpeed;
    }

    set period(period) {
        this.waveSourceAngularSpeed = 1 / period;
    }

    get stride() {
        return 1 / (this.nodeNum + 1);
    }

    set stride(stride) {
        this.nodeNum = Math.ceil(1 / stride) - 1;
    }

    get color() {
        return this.pColor;
    }

    set color(color) {
        this.pColor = color;
        this.paths.style("stroke", color);
    }

    private waveSourceAngularSpeed = 0;
    private nodeNum = 0;
    private offsets = [new Float32Array(), new Float32Array()];
    private currentOffsetsIndex = 0;

    private get currentOffsets() {
        return this.offsets[this.currentOffsetsIndex];
    }

    private get lastOffsets() {
        return this.offsets[Number(!this.currentOffsetsIndex)];
    }

    private get waveSpeedInStrides() {
        return this.waveSpeed * (this.nodeNum + 1);
    }

    private waveSourcePhase = 0;
    private waveSourceOffsets = new Float32Array();
    private pColor = "";
    private svg: Selection<SVGSVGElement, any, null, undefined>;

    private paths: Selection<SVGPathElement, SVGSVGElement, any, any> =
        select(document.createElementNS("http://www.w3.org/2000/svg", "path"));

    private width = 0;
    private height = 0;

    constructor(period = 1000, waveSpeed = .001, stride = .05, { color = "#fff" }: { color?: string } = {}) {
        this.period = period;
        this.waveSpeed = waveSpeed;
        this.stride = stride;
        this.color = color;

        this.svg = select(document.createElementNS("http://www.w3.org/2000/svg", "svg"))
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

    public draw(data: number[], delta: number = 1000 / 60) {
        if (!data.length) {
            return;
        }

        if (this.offsets[0].length !== data.length * this.nodeNum || this.waveSourceOffsets.length !== data.length) {
            this.offsets = this.offsets.map(() => new Float32Array(data.length * this.nodeNum).map(() => 0));

            const path = this.svg.selectAll("path").data(data);

            path.enter()
                .append("path")
                .style("stroke", this.color)
                .style("stroke-width", 2)
                .style("fill", "none")
                .style("opacity", 0)
                .transition()
                .duration(1200)
                .ease(easeQuadInOut)
                .style("opacity", 1);

            path.exit()
                .transition()
                .duration(1200)
                .ease(easeQuadInOut)
                .style("opacity", 0)
                .remove();

            this.paths = this.svg.selectAll("path");
        }

        this.updateWaveSourcePhase(delta);

        this.waveSourceOffsets =
            new Float32Array(data.map((val) => Math.sin(this.waveSourcePhase * 2 * Math.PI) * val));

        this.simulate(delta);

        this.paths.attr("d", (d, i) => {
            const points = new Array<{ x: number, y: number }>(this.nodeNum);
            const indexOffset = i * this.nodeNum;

            for (let j = 0, len = this.nodeNum; j < len; j++) {
                points[j] = {
                    x: this.stride * (j + 1),
                    y: this.currentOffsets[indexOffset + j],
                };
            }

            return getPath(points, this.width, this.height);
        });
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

    private simulate(delta: number) {
        const f1 = this.waveSpeedInStrides * this.waveSpeedInStrides * delta * delta;
        const f2 = 1 / (RESISTANCE_FACTOR * delta + 2);
        const k1 = (2 - 4 * f1) * f2;
        const k2 = (RESISTANCE_FACTOR * delta - 2) * f2;
        const k3 = 2 * f1 * f2;

        for (let i = 0, offsetsLength = this.waveSourceOffsets.length; i < offsetsLength; i++) {
            const indexOffset = i * this.nodeNum;

            for (let j = 0, nodeNum = this.nodeNum; j < nodeNum; j++) {
                const currentOffset = this.currentOffsets[indexOffset + j];
                const lastOffset = this.lastOffsets[indexOffset + j];
                const previousOffset = this.currentOffsets[indexOffset + j - 1] || this.waveSourceOffsets[i];
                const nextOffset = this.currentOffsets[indexOffset + j + 1] || 0;

                this.lastOffsets[indexOffset + j] = k1 * currentOffset + k2 * lastOffset
                    + k3 * (previousOffset + nextOffset);
            }
        }

        this.swapOffsets();
    }

    private swapOffsets() {
        this.currentOffsetsIndex = Number(!this.currentOffsetsIndex);
    }

    private updateWaveSourcePhase(delta: number) {
        let phase = this.waveSourcePhase;

        phase += this.waveSourceAngularSpeed * delta;

        if (phase >= 1) {
            phase = phase % 1;
        }

        this.waveSourcePhase = phase;
    }
}
