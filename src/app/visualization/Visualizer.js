/**
 * Created by qhyang on 2017/12/15.
 */

import Clubber from 'clubber';

import VisualizationRenderer from './VisualizationRenderer';

export default class Visualizer {
    constructor({ type }) {
        this._clubber = new Clubber({
            size: 2048,
            mute: false
        });

        this.setType(type || 'bars');
        this._renderNode = null;
    }

    setType(type) {
        this._type = type;

        switch (type) {
            case 'bars':
                this._renderer = new VisualizationRenderer('bars');
                break;
            default:
                this._renderer = new VisualizationRenderer('bars');
                break;

        }

        if (this._renderNode) {
            this._renderer.mount(this.unMount());
        }
    }

    listen(audioSource) {
        this._clubber.listen(audioSource);
        this._active = false;
    }

    start() {
        let bands = [];

        if (this._type === 'bars') {
            for (let i = 0; i < 32; i++) {
                bands[i] = this._clubber.band({
                    from: i * 5,
                    to: i * 5 + 5,
                    smooth: [0.1, 0.1, 0.1, 0.1]
                });
            }
        }

        this._active = true;

        const render = () => {
            this._clubber.update();

            let data = [];

            bands.forEach((band, index) => {
                data[index] = new Array(4);
                band(data[index]);
            });

            this._renderer.render(data);

          if (this._active) {
              requestAnimationFrame(render);
          }
        };

        render();
    }

    stop() {
        this._active = false;
    }

    mount(renderNode) {
        this._renderer.mount(renderNode);
        this._renderNode = renderNode;
    }

    unMount() {
        this._renderer.unMount();
        this._renderNode = null;
    }
}