/**
 * Created by qhyang on 2018/2/28.
 */

import VisualController from './VisualController';

export default class Background extends VisualController {
    animating = false;

    get activeType() {
        return super.activeType;
    }

    set activeType(type) {
        if (this._active) {
            this.activeRenderer.hide();
            this.activeRenderer.stopAnimate();
            this.activeRenderer.pause();
        }

        super.activeType = type;
        this._picture && this.activeRenderer.renderPicture(this._picture);

        if (this._active) {
            this.activeRenderer.start();
            this.activeRenderer.animate();
            this.activeRenderer.show();
        }
    }

    constructor(type, renderers) {
        super(type);

        const { threeRenderer, artworkRenderer } = renderers;

        this._renderers = {
            three: threeRenderer,
            artwork: artworkRenderer
        };
    }

    start() {
        super.start();

        const { artworkRenderer } = this._renderers.artwork;

        if (this.activeRenderer === artworkRenderer) {
            return;
        }

        this.activeRenderer.animate();
    }

    stop() {
        super.stop();

        this.activeRenderer.stopAnimate();
    }

    async event(type) {
        this.animating = true;
        await this.activeRenderer.event(type);
        this.animating = false;
    }
};