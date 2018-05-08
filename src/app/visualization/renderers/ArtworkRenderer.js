/**
 * Created by qhyang on 2018/5/8.
 */

import scale from '../../../scripts/scale';
import applyCanvasMask from '../../../scripts/canvasMask';

import Renderer from './Renderer';

import { loadImage } from '../../../scripts/utils';

export default class ArtworkRenderer extends Renderer {
    init(mountPoint) {
        this.root = document.createElement('div');
        this.root.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-size: 50%;
            background-position: center;
            background-repeat: no-repeat;
            transition: opacity .6s;
        `;
        mountPoint.appendChild(this.root);
    }

    async renderPicture(url) {
        url = applyCanvasMask(scale({ width: 200, height: 200 }, await loadImage(url)), await loadImage(require('../../../assets/mask.png')), 200, 200, true);

        this.root.style.backgroundImage = `url("${url}")`;
    }

    show() {
        super.show();
        this.root.style.opacity = 1;
    }

    hide() {
        super.hide();
    }
}
