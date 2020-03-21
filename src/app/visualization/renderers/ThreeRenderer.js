/**
 * Created by qhyang on 2018/2/28.
 */

import config from '../../../config';

import ThreeAudioVisualization from 'three-audio-visualization';

import Renderer from './Renderer';

const color = (() => {
    const colors = config.colorSet;

    colors.splice(2, 2);

    let i = 0;

    return () => {
        if (i === colors.length) {
            i = 0;
        }

        return colors[i++];
    };
})();

export default class ThreeRenderer extends Renderer {
    mode;
    animating = false;
    animateTimeout;
    tileAnimateTimeouts = [];

    constructor() {
        super();
        this.bandWidth = 128;
        this.threeAudioVisualization = new ThreeAudioVisualization;
        this.mode = 'basic';
    }

    init(mountPoint) {
        super.init(mountPoint);

        this.threeAudioVisualization.init(this.root.offsetWidth || window.innerWidth, this.root.offsetHeight || window.innerHeight);

        this.threeAudioVisualization.mount(this.root);
    }

    renderAudio(bands) {
        if (this.animating) {
            this.stopAnimate();
        }

        if (this.mode === 'basic') {
            this.mode = 'physics';
            this.threeAudioVisualization.switchMode('physics');
        }

        let data = [];

        bands.forEach((band, index) => {
            data[index] = new Array(5);
            band(data[index]);
        });

        this.threeAudioVisualization.applyForces(...data.map(band => Math.sqrt(band[3] * 500000000000)));
    }

    start() {
        if (this.active) {
            return;
        }

        this.active = true;
        this.threeAudioVisualization.start();
        this.threeAudioVisualization.enableReactiveCamera();

        super.start();
    }

    pause() {
        this.active = false;
        this.threeAudioVisualization.pause();

        super.pause();
    }

    show() {
        this.threeAudioVisualization.show();
    }

    hide() {
        this.threeAudioVisualization.hide();
    }

    animate() {
        super.animate();

        if (this.animating) {
            this.stopAnimate();
        }

        this.animating = true;

        requestAnimationFrame(async () => {
            if (!this.animating) {
                return;
            }

            if (this.mode === 'physics') {
                this.mode = 'basic';
                await this.threeAudioVisualization.switchMode('basic');
            }

            this.threeAudioVisualization.startFloatingTiles(10);

            color();

            const animateTiles = () => {
                const tileColor = color();

                this.threeAudioVisualization._tiles.forEach((tile, index) => {
                    this.tileAnimateTimeouts[index] = setTimeout(() => {
                        this.threeAudioVisualization.rollOverTile(index, {
                            color: tileColor,
                            direction: 'horizontal'
                        });
                    }, 500 * Math.random());
                });

                this.animateTimeout = setTimeout(() => {
                    animateTiles();
                }, 3000 + 10000 * Math.random());
            };

            animateTiles();
        });
    }

    stopAnimate() {
        super.stopAnimate();

        this.animating = false;

        clearTimeout(this.animateTimeout);

        this.tileAnimateTimeouts.forEach(timeout => {
            clearTimeout(timeout);
        });

        this.threeAudioVisualization.stopFloatingTiles();
    }

    async event(type) {
        let layout = type;

        if (type === 'reset') {
            layout = 'musicNote';
        }

        this.stopAnimate();

        if (this.mode === 'physics') {
            this.threeAudioVisualization._currentLayout = layout;

            try {
                this.mode = 'basic';
                await this.threeAudioVisualization.switchMode('basic');
            } catch (e) { }

            this.mode = 'basic';
        } else {
            try {
                await this.threeAudioVisualization.switchLayout(layout);
            } catch (e) { }
        }

        this.animate();
    }
}
