/**
 * Created by qhyang on 2018/2/28.
 */

export default class Renderer {
    root;
    bandWidth;
    active;

    constructor() {
        this.active = false;
    }

    init(mountPoint) {
        this.root = document.createElement('div');
        this.root.style.cssText = 'position: absolute; left: 0; top: 0; width: 100%; height: 100%;';
        mountPoint.appendChild(this.root);
    }

    renderAudio() { }

    show() {
        this.root.style.display = 'block';
    }

    hide() {
        this.root.style.display = 'none';
    }

    start() { }

    pause() {
        this.stopAnimate();
    }

    animate() { }

    stopAnimate() { }
}
