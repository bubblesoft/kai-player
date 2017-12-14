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

    get duration() {
        return this._duration;
    }

    get artists() {
        return this._artists;
    }

    constructor({id, name, duration, artists, getSrc }) {
        this._id = id;
        this._name = name;
        this._duration = duration;
        this._artists = artists;
        this._getSrc = getSrc;
    }

    // Return a promise
    getSrc() {
        return this._getSrc(this);
    }
}
