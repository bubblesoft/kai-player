/**
 * Created by qhyang on 2018/2/28.
 */

import Histogram from '../../../scripts/Histogram';

import Renderer from './Renderer';

const histogram = new Histogram;

export default class HistogramRenderer extends Renderer {
    init(mountPoint) {
        super.init(mountPoint);

        // How much nodes contained in a band.
        this.bandWidth = (() => {
            const barWidth = 60; // Expected bar width in px.

            let _bandWidth = Math.ceil(128 * barWidth / (mountPoint.offsetWidth || window.innerWidth));

            while (128 % _bandWidth > 0) {
                _bandWidth--;
            }

            return _bandWidth;
        })();

        histogram.init(this.root, 128 / this.bandWidth, 2);
    }

    renderAudio(bands) {
        let data = [];

        bands.forEach((band, index) => {
            data[index] = new Array(5);
            band(data[index]);
        });

        histogram.draw(data.map(band => band[3]), 0);
        histogram.draw(data.map(band => band[4]), 1);
    }

    show() {
        histogram.show();
    }

    hide() {
        histogram.reset();
        histogram.hide();
    }
};
