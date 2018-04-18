/**
 * Created by qhyang on 2018/4/17.
 */

import config from '../../../config';

import ElectricArc from '../../../scripts/ElectricArc';

import Renderer from './Renderer';

const electricArc = new ElectricArc(40);

const color = (() => {
    const colors = config.colorSet;

    let i = 0;

    return () => {
        if (i > 4) {
            i = 0;
        }

        return colors[i++];
    };
})();

export default class ElectricArcRenderer extends Renderer {
    _suspend = false;

    init(mountPoint) {
        super.init(mountPoint);

        // How much nodes contained in a band.
        this.bandWidth = (() => {
            const space = 30; // Expected space in px between two vertices.

            let _bandWidth = Math.ceil(128 * space / (mountPoint.offsetWidth || window.innerWidth));

            while (128 % _bandWidth > 0) {
                _bandWidth--;
            }

            return _bandWidth;
        })();

        electricArc.init(this.root);
        electricArc.setColor(color());
    }

    renderAudio(bands) {
        if (!this._suspend) {
            this._suspend = true;

            setTimeout(() => {
                this._suspend = false;
            }, 40);

            let data = [];

            bands.forEach((band, index) => {
                data[index] = new Array(5);
                band(data[index]);
            });

            electricArc.draw(data.map(band => band[4]));
        }
    }

    start() {
        if (this.active) {
            return;
        }

        this.active = true;

        const changeColor = () => {
            electricArc.setColor(color());

            if (this.active) {
                setTimeout(changeColor, 60000);
            }
        };

        changeColor();

        super.start();
    }

    pause() {
        this.active = false;

        super.pause();
    }

    show() {
        electricArc.show();
    }

    hide() {
        electricArc.hide();
    }
};
