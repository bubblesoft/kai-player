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

    constructor({ src, title }) {
        this._src = src;
        this._title = title;
    }
}
