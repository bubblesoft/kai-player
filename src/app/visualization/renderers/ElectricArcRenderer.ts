import config from "../../../config";

import ElectricArc from "../../../scripts/ElectricArc";

import IRenderer from "./IRenderer";

import Queue from "../../Queue";
import Renderer from "./Renderer";

export default class extends Renderer implements IRenderer {
    public bandWidth = 0;
    private electricArc: ElectricArc;
    private colorQueue: Queue<string>;
    private suspend = false;

    constructor() {
        super();

        this.electricArc = new ElectricArc();
        this.colorQueue = new Queue<string>();
        this.colorQueue.add(config.colorSet);
    }

    public init(mountPoint: HTMLElement) {
        super.init(mountPoint);

        // How much nodes contained in a band.
        this.bandWidth = (() => {
            const maxBandNum = 15;

            // Expected space in px between two vertices.
            const space = Math.max(30, (mountPoint.offsetWidth || window.innerWidth) / maxBandNum);

            let bandWidth = Math.ceil(128 * space / (mountPoint.offsetWidth || window.innerWidth));

            while (128 % bandWidth > 0) {
                bandWidth--;
            }

            return bandWidth;
        })();

        this.electricArc.mount(this.root);
        this.electricArc.color = this.colorQueue.get(0);

        return this;
    }

    public renderAudio(bands?: Array<(data: number[]) => void>, delta?: number) {
        if (!bands) {
            return super.renderAudio();
        }

        if (!this.suspend) {
            this.suspend = true;

            setTimeout(() => {
                this.suspend = false;
            }, 40);

            const data: number[][] = [];

            bands.forEach((band, index) => {
                data[index] = new Array(5);
                band(data[index]);
            });

            this.electricArc.draw(data.map((band) => band[4]), delta);
        }

        return this;
    }

    public start() {
        if (this.active) {
            return this;
        }

        this.active = true;

        const changeColor = () => {
            this.colorQueue.next();

            if (typeof this.colorQueue.activeIndex === "number") {
                this.electricArc.color = this.colorQueue.get(this.colorQueue.activeIndex);
            }

            if (this.active) {
                setTimeout(changeColor, 60000);
            }
        };

        changeColor();

        return super.start();
    }

    public pause() {
        this.active = false;

        return super.pause();
    }

    public show() {
        this.electricArc.show();

        return super.show();
    }

    public hide() {
        this.electricArc.hide();

        return super.hide();
    }
}
