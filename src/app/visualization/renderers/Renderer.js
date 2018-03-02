/**
 * Created by qhyang on 2018/2/28.
 */

export default class Renderer {
    root;
    bandWidth;

    constructor() { }

    init(mountPoint) {
        this.root = document.createElement('div');
        this.root.style.cssText = 'width: 100%; height: 100%;';
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

    stop() { }
}
