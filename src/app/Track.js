/**
 * Created by qhyang on 2017/12/11.
 */

export default class Track {
    duration;
    streamUrl;
    _artists;
    _getStreamUrl;
    _id;
    _name;
    _picture;

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get artists() {
        return this._artists;
    }

    get picture() {
        return this._picture;
    }

    constructor({id, name, duration, artists, getStreamUrl, picture }) {
        this.streamUrl = null;
        this._id = id;
        this._name = name;
        this.duration = duration;
        this._artists = artists;
        this._getStreamUrl = getStreamUrl;
        this._picture = picture;
    }

    loadStreamUrl() {
        if (typeof this._getStreamUrl === 'function') {
            return this._getStreamUrl(this);
        }

        return (async() => {
            this.streamUrl = (await (await fetch('/audio/streamurl', {
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
