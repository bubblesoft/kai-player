/**
 * Created by qhyang on 2018/2/28.
 */

import IRenderer from "./IRenderer";

export default abstract class Renderer implements IRenderer {
    protected readonly root: HTMLElement;
    protected active: boolean;
    private animating: boolean;

    protected constructor() {
        this.root = document.createElement("div");

        this.root.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;

        this.active = false;
        this.animating = false;
    }

    public init(mountPoint: HTMLElement) {
        mountPoint.appendChild(this.root);

        return this;
    }

    public renderAudio(): this;
    public renderAudio(bands: Array<(data: number[]) => void>, delta: number): this;
    public renderAudio(bands?: Array<(data: number[]) => void>, delta?: number) {
        return this;
    }

    public renderPicture() {
        return this;
    }

    public show() {
        this.root.style.display = "block";

        return this;
    }

    public hide() {
        this.root.style.display = "none";

        return this;
    }

    public start() {
        return this;
    }

    public pause() {
        this.stopAnimate();

        return this;
    }

    public animate() {
        this.animating = true;

        return this;
    }

    public stopAnimate() {
        this.animating = false;

        return this;
    }

    public event() {
        return Promise.resolve();
    }
}
