/**
 * Created by qhyang on 2018/3/1.
 */

const mapTypeName = type => {
    switch (type) {
        case 'three':
            return 'Tiles';
        case 'histogram':
            return 'Histogram';
        case 'ribbon':
            return 'Waving Ribbon';
        case 'electricArc':
            return 'Electric Arc';
        case 'artwork':
            return 'Artwork';
    }
};

export default class VisualController {
    _renderers;
    _activeType;
    _mountPoint;
    _root;
    _active;
    _picture;

    get types() {
        return Reflect.ownKeys(this._renderers).filter((key) => key !== "__ob__").map((type) => ({
            name: mapTypeName(type),
            value: type
        }));
    }

    get activeType() {
        return this._activeType;
    }

    set activeType(type) {
        this._activeType = type;
    }

    get activeRenderer() {
        return this._renderers[this._activeType];
    }

    constructor(type) {
        this._activeType = type;
        this._mountPoint = null;
        this._root = document.createElement('div');
        this._root.style.cssText = 'width: 100%; height: 100%;';
    }

    show() { }

    hide() { }

    start() {
        this._active = true;
    }

    stop() {
        this._active = false;
    }

    loadResource({ picture } = {}) {
        this._picture = picture;
        this.activeRenderer.renderPicture(picture);
    }
};
