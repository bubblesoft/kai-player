/**
 * Created by qhyang on 2017/12/15.
 */

import Clubber from 'clubber';

import VisualController from './VisualController';
import { threeRenderer, histogramRenderer } from '../renderers/renderers';

import '../../../styles/histogram';


export default class Visualizer extends VisualController{
    bands = [];
    _active;

    constructor(type) {
        super(type);

        this._renderers = {
            three: threeRenderer,
            histogram: histogramRenderer
        };

        this._clubber = new Clubber({
            size: 2048,
            mute: false
        });
    }

    listen(audioSource) {
        this._clubber.listen(audioSource);
    }

    start() {
        const renderer = this._renderers[this.activeType],
            bandWidth = renderer.bandWidth;

        for (let i = 0; i < 128 / bandWidth; i++) {
            this.bands[i] = this._clubber.band({
                template: '01234',
                from: i * bandWidth,
                to: i * bandWidth + bandWidth,
                smooth: [0.1, 0.1, 0.1, 0.1, 0.1]
            });
        }

        this._active = true;

        const render = () => {
            this._clubber.update();
            renderer.renderAudio(this.bands);

          if (this._active) {
              requestAnimationFrame(render);
          }
        };

        renderer.show();
        render();
    }

    stop() {
        this._active = false;

        requestAnimationFrame(() => {
            this._renderers[this.activeType].hide();
        });
    }
}