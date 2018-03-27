/**
 * Created by qhyang on 2018/2/28.
 */

import VisualController from './VisualController';
import { threeRenderer } from '../renderers/renderers';

export default class Background extends VisualController {
    get activeType() {
        return super.activeType;
    }

    set activeType(type) {
        this.activeRenderer.stop();
        super.activeType = type;
        this.activeRenderer.start();
    }

    constructor(type) {
        super(type);

        this._renderers = {
            three: threeRenderer
        };
    }

    start() {
        this.activeRenderer.animate();
    }

    stop() {
        this.activeRenderer.stopAnimate();
    }

    event(type) {
        this.activeRenderer.event(type);
    }
};