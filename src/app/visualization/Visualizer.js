/**
 * Created by qhyang on 2017/12/15.
 */

import jQuery from 'jquery';
import Clubber from 'clubber';

import Bars from '../../scripts/Bars';

const renderers = {
  'bars': new Bars
};

export default class Visualizer {
    renderer;
    bands;
    _domNode;
    _root;

    constructor({ type }) {
        this._clubber = new Clubber({
            size: 2048,
            mute: false
        });

        this.setType(type || 'bars');
        this._domNode = null;
        this._root = jQuery('<div style="width: 100%; height: 100%">').get(0);
    }

    setType(type) {
        this._type = type;

        if (this._domNode) {
            this.mount(this.unMount());
        }
    }

    init() {
        let bandWidth; // How much nodes contained in a band.

        if (this._type === 'bars') {
            this.renderer = renderers['bars'];

            bandWidth = (() => {
                const barWidth = 60; // Expected bar width in px.

                let _bandWidth = Math.ceil(128 * barWidth / (jQuery(this._root).width() || jQuery(window).width()));
                while (128 % _bandWidth > 0) {
                    _bandWidth--;
                }

                return _bandWidth;
            })();

            this.renderer.init(this._root, 128 / bandWidth);
        }

        this.bands = [];

        for (let i = 0; i < 128 / bandWidth; i++) {
            this.bands[i] = this._clubber.band({
                from: i * bandWidth,
                to: i * bandWidth + bandWidth,
                smooth: [0.1, 0.1, 0.1, 0.1]
            });
        }
    }

    listen(audioSource) {
        this._clubber.listen(audioSource);
        this._active = false;
    }

    start() {
        this._active = true;

        const render = () => {
            this._clubber.update();

            let data = [];

            this.bands.forEach((band, index) => {
                data[index] = new Array(4);
                band(data[index]);
            });

            this.renderer.draw(data.map(band => band[2]));

          if (this._active) {
              requestAnimationFrame(render);
          }
        };

        render();
    }

    stop() {
        this._active = false;
        requestAnimationFrame(() => {
            this.renderer.reset();
        });
    }

    mount(domNode) {
        jQuery(domNode).append(jQuery(this._root));
        this._domNode = domNode;
    }

    unMount() {
        jQuery(this._domNode).detach();

        const domNode = this._domNode;

        this._domNode = null;

        return this.domNode;
    }
}