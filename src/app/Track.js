/**
 * Created by qhyang on 2017/12/11.
 */

import config from '../config';

export default class Track {
    _id;
    _name;
    _duration;
    _artists;
    _getStreamUrl;

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

    constructor({id, name, duration, artists, getStreamUrl }) {
        this._id = id;
        this._name = name;
        this._duration = duration;
        this._artists = artists;
        this._getStreamUrl = getStreamUrl;
    }

    // Return a promise
    getStreamUrl() {
        if (typeof this._getStreamUrl === 'function') {
            return this._getStreamUrl(this);
        }

        return (async() => {
            return (await (await fetch(config.urlBase + '/audio/streamurl', {
                method: 'POST',
                body: JSON.stringify({
                    id: this.id.split('_')[1],
                    source: this.id.split('_')[0]
                }),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            })).json()).data;
        })();
    }
}
