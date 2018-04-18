/**
 * Created by qhyang on 2018/3/1.
 */

import { threeRenderer, histogramRenderer, electricArcRenderer } from '../renderers/renderers';

const mapTypeName = type => {
    switch (type) {
        case 'three':
            return 'Tiles';
        case 'histogram':
            return 'Histogram';
        case 'electricArc':
            return 'Electric Arc';
    }
};

export default class VisualController {
    _renderers = {
        three: threeRenderer,
        histogram: histogramRenderer,
        electricArc: electricArcRenderer
    };
    _activeType;
    _mountPoint;
    _root;

    get types() {
        return Object.keys(this._renderers).map(type => {
            return {
                name: mapTypeName(type),
                value: type
            };
        });
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

    start() { }

    stop() { }
};
