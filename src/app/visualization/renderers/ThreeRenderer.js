/**
 * Created by qhyang on 2018/2/28.
 */

import ThreeAudioVisualization from 'three-audio-visualization';

import Renderer from './Renderer';

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

    show() {
        this.threeAudioVisualization.show();
    }

    hide() {
        this.threeAudioVisualization.hide();
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

    animate() {
        requestAnimationFrame(() => {
            if (this.mode === 'physics') {
                this.threeAudioVisualization.switchMode('basic');
                this.mode = 'basic';
            }

            this.threeAudioVisualization.startFloatingTiles(50);

            super.animate();
        });
    }

    stopAnimate() {
        this.threeAudioVisualization.stopFloatingTiles();

        super.stopAnimate();
    }

    event(type) {
        switch (type) {
            case 'reset':
                this.threeAudioVisualization.switchLayout('musicNote');

                if (this.mode === 'physics') {
                    this.threeAudioVisualization.switchMode('basic');
                }

                break;

            case 'play':
                this.threeAudioVisualization.switchLayout('play');

                if (this.mode === 'physics') {
                    this.threeAudioVisualization.switchMode('basic');
                }

                break;
        }
    }
}
