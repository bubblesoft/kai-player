/**
 * Created by qhyang on 2018/2/28.
 */

import ThreeAudioVisualization from 'three-audio-visualization';

import Renderer from './Renderer';

export default class ThreeRenderer extends Renderer {
    constructor() {
        super();
        this.threeAudioVisualization = new ThreeAudioVisualization;
    }

    init(mountPoint) {
        super.init(mountPoint);

        this.threeAudioVisualization.init(this.root.offsetWidth || window.innerWidth, this.root.offsetHeight || window.innerHeight, {
            accentColor: '#fff',
            accentIndices: [6]
        });

        this.threeAudioVisualization.mount(this.root);
    }

    renderAudio(bands) { }

    start() {
        this.threeAudioVisualization.start();
        this.threeAudioVisualization.startFloatingTiles(50);
        super.start();
    }

    stop() {
        this.threeAudioVisualization.stopFloatingTiles();
        super.stop();
    }

    event(type) {
        switch (type) {
            case 'reset':
                this.threeAudioVisualization.switchLayout('musicNote');
                break;
            case 'play':
                this.threeAudioVisualization.switchLayout('play');
                break;
        }
    }
}
