/**
 * Created by qhyang on 2018/2/28.
 */

import VisualController from './VisualController';
import { threeRenderer, artworkRenderer } from '../renderers/renderers';

export default class Background extends VisualController {
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

    constructor(type) {
        super(type);

        this._renderers = {
            three: threeRenderer,
            artwork: artworkRenderer
        };
    }

    start() {
        super.start();

        if (this.activeRenderer === artworkRenderer) {
            return;
        }

        this.activeRenderer.animate();
    }

    stop() {
        super.stop();

        this.activeRenderer.stopAnimate();
    }

    loadResource({ picture } = {}) {
        super.loadResource({ picture });
        this.activeRenderer.renderPicture(picture);

    }

    async event(type) {
        await this.activeRenderer.event(type);
    }
};