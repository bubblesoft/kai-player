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
        this._renderers[this._activeType].stop();
        super.activeType = type;
        this._renderers[this._activeType].start();
    }

    constructor(type) {
        super(type);

        this._renderers = {
            three: threeRenderer
        };
    }

    start() {
        this._renderers[this.activeType].start();
        this._renderers[this.activeType].show();
    }

    stop() {
        this._renderers[this.activeType].stop();
        this._renderers[this.activeType].hide();
    }

    event(type) {
        this._renderers[this.activeType].event(type);
    }
};