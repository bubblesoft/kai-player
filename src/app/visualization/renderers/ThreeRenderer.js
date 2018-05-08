/**
 * Created by qhyang on 2018/2/28.
 */

import config from '../../../config';

import ThreeAudioVisualization from 'three-audio-visualization';

import Renderer from './Renderer';

const color = (() => {
    const colors = config.colorSet;

    let i = 0;

    return () => {
        if (i > 5) {
            i = 0;
        }

        return colors[i++];
    };
})();

export default class ThreeRenderer extends Renderer {
    mode;

    constructor() {
        super();
        this.bandWidth = 128;
        this.threeAudioVisualization = new ThreeAudioVisualization;
        this.mode = 'basic';
    }

    init(mountPoint) {
        super.init(mountPoint);

        this.threeAudioVisualization.init(this.root.offsetWidth || window.innerWidth, this.root.offsetHeight || window.innerHeight, {
            accentColor: '#fff',
            accentIndices: [0]
        });

        this.threeAudioVisualization.mount(this.root);
    }

    renderAudio(bands) {
        window.threeAudioVisualization = this.threeAudioVisualization;

        if (this.mode === 'basic') {
            this.threeAudioVisualization.switchMode('physics');
            this.mode = 'physics';
        }

        let data = [];

        bands.forEach((band, index) => {
            data[index] = new Array(5);
            band(data[index]);
        });

        this.threeAudioVisualization.applyForces(...data.map(band => Math.sqrt(band[3] * 800000000000)));
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

        requestAnimationFrame(async () => {
            if (this.mode === 'physics') {
                this.mode = 'basic';
                this.threeAudioVisualization.switchMode('basic');
            }

            this.threeAudioVisualization.startFloatingTiles(20);

            color();

            const animateTiles = () => {
                if (this.animating) {
                    const tileColor = color();

                    this.threeAudioVisualization._tiles.forEach((tile, index) => {
                        setTimeout(() => {
                            this.threeAudioVisualization.rollOverTile(index, {
                                color: tileColor,
                                direction: 'horizontal'
                            });
                        }, 500 * Math.random());
                    });

                    setTimeout(() => {
                        animateTiles();
                    }, 3000 + 10000 * Math.random());
                }
            };

            animateTiles();
        });
    }

    stopAnimate() {
        super.stopAnimate();

        this.threeAudioVisualization.stopFloatingTiles();
    }

    async event(type) {
        let layout = type;

        if (type === 'reset') {
            layout = 'musicNote';
        }

        if (this.mode === 'physics') {
            this.threeAudioVisualization._currentLayout = layout;
            await this.threeAudioVisualization.switchMode('basic');
            this.mode = 'basic';
        } else {
            await this.threeAudioVisualization.switchLayout(layout);
        }
    }
}
