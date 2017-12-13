/**
 * Created by qhyang on 2017/12/11.
 */

export default class Track {
    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get length() {
        return this._length;
    }

    constructor({id, name, length, srcGetter }) {
        this._id = id;
        this._name = name;
        this._length = length;
        this._srcGetter = srcGetter;
    }

    // Return a promise
    getSrc() {
        return this._srcGetter(this);
    }
}
