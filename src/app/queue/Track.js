/**
 * Created by qhyang on 2017/12/11.
 */

export default class Track {
    get src() {
        return this._src;
    }

    get title() {
        return this._title;
    }

    get length() {
        return this._length;
    }

    constructor({ src, title, length }) {
        this._src = src;
        this._title = title;
        this._length = length;
    }
}
