/**
 * Created by qhyang on 2018/5/8.
 */

import config from "../../../config";

import scale from '../../../scripts/scale';
import applyCanvasMask from '../../../scripts/canvasMask';

import Renderer from './Renderer';

import { loadImage, requestNetworkIdle } from '../../../scripts/utils';

export default class ArtworkRenderer extends Renderer {
    init(mountPoint) {
        this.root = document.createElement('div');
        this.root.style.cssText = `
            display: none;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-size: 50%;
            background-position: center;
            background-repeat: no-repeat;
            transition: opacity .6s;
            pointer-events: none;
        `;
        mountPoint.appendChild(this.root);
    }

    renderPicture(url) {
        return new Promise((resolve, reject) => {
            requestNetworkIdle(async () => {
                try {
                    const base64Url = applyCanvasMask(scale({ width: 200, height: 200 }, await (async () => {
                        try {
                            return await loadImage(url);
                        } catch (e) {
                            console.log(e);

                            try {
                                return await loadImage(`/proxy/${config.defaultImages[Math.floor(config.defaultImages.length * Math.random())]}`);
                            } catch (e) {
                                console.log(e);

                                return await loadImage(config.defaultImages[Math.floor(config.defaultImages.length * Math.random())]);
                            }
                        }
                    })()), await loadImage(require('../../../assets/mask.png')), 200, 200, true);

                    this.root.style.backgroundImage = `url("${base64Url}")`;

                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    show() {
        super.show();
        this.root.style.opacity = 1;
    }

    hide() {
        super.hide();
    }
}
