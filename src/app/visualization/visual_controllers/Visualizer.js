/**
 * Created by qhyang on 2017/12/15.
 */

import Clubber from 'clubber';

import VisualController from './VisualController';
import { threeRenderer, histogramRenderer, electricArcRenderer } from '../renderers/renderers';

import '../../../styles/histogram';


export default class Visualizer extends VisualController{
    _random;
    _active;
    _clubber;

    get types() {
        return [{
            name: 'Random',
            value: 'random'
        }].concat(super.types);
    }

    get activeType() {
        if (this._random) {
            return 'random';
        }

        return super.activeType;
    }

    set activeType(type) {
        if (type === 'random') {
            this._random = true;

            const rendererTypes = Object.keys(this._renderers);

            super.activeType = rendererTypes[Math.floor(rendererTypes.length * Math.random())];
        } else {
            this._random = false;
            super.activeType = type;
        }

        if (this._active) {
            this.stop();
            this.start();
        }
    }

    constructor(type) {
        const renderers = {
            three: threeRenderer,
            histogram: histogramRenderer,
            electricArc: electricArcRenderer
        };

        if (type === 'random') {
            const rendererTypes = Object.keys(renderers);

            super(rendererTypes[Math.floor(rendererTypes.length * Math.random())]);
            this._random = true;
        } else {
            super(type);
        }

        this._renderers = renderers;
        this._active = false;

        this._clubber = new Clubber({
            size: 2048,
            mute: false
        });
    }

    listen(audioSource) {
        this._clubber.listen(audioSource);
    }

    start() {
        if (this._active) {
            return;
        }

        const bandWidth = this.activeRenderer.bandWidth;

        let bands = [];

        for (let i = 0; i < 128 / bandWidth; i++) {
            bands[i] = this._clubber.band({
                template: '01234',
                from: i * bandWidth,
                to: i * bandWidth + bandWidth,
                smooth: [0.1, 0.1, 0.1, 0.1, 0.1]
            });
        }

        const render = () => {
            this._clubber.update();
            this.activeRenderer.renderAudio(bands);


            if (this._active) {
                requestAnimationFrame(render);
            }
        };

        requestAnimationFrame(() => {
            this._active = true;
            render();
        });

    }

    stop() {
        this._active = false;
    }
}