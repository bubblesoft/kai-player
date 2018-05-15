/**
 * Created by qhyang on 2017/12/12.
 */

import Track from '../Track';
import Artist from '../Artist';

import { urlBase } from '../../scripts/utils';

export default class Channel {

    /**
     * 来源：
     *
     *　wy   网易云音乐
     *
     */
    source;

    /**
     * 列表类型
     *
     * hot  热歌榜
     */
    type;

    get name() {
        return this._name;
    }

    constructor({ source, type, name, get }) {

        this.source = source;
        this.type = type;
        this._name = name;
        this._get = get;
    }

    async get() {
        if (this._get) {
            return this._get();
        }

        return (await (await fetch('/audio/list', {
            method: 'POST',
            body: JSON.stringify({
                source: this.source,
                channel: this.type
            }),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })).json()).data.map(trackData => {
            return new Track({
                id: this.source + '_' + trackData.id,
                name: trackData.name,
                duration: trackData.dt,
                artists: trackData.artists.map(artist => new Artist({ name: artist.name })),
                picture: trackData.picture
            })
        });
    }
}
