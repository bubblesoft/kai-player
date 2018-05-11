/**
 * Created by qhyang on 2018/2/28.
 */

export default class Renderer {
    _picture;

    constructor() {
        this.active = false;
    }

    init(mountPoint) {
        this.root = document.createElement('div');
        this.root.style.cssText = 'position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;';
        mountPoint.appendChild(this.root);
    }

    renderAudio() { }

    renderPicture() { }

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

    animate() {
        this.animating = true;
    }

    stopAnimate() {
        this.animating = false;
    }

    event() {
        return Promise.resolve();
    }
}
