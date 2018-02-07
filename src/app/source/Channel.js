/**
 * Created by qhyang on 2017/12/12.
 */

import Track from '../Track';
import Artist from '../Artist';

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

    get() {
        if (this._get) {
            return this._get();
        }

        return (async() => {
            const data = (await (await fetch(require('../../config').urlBase + '/audio/list', {
                method: 'POST',
                body: JSON.stringify({
                    source: this.source,
                    channel: this.type
                }),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            })).json()).data,
                tracks = [];

            data.forEach(el => {
                tracks.push(new Track({
                    id: 'netease_' + el.id,
                    name: el.name,
                    duration: el.dt,
                    artists: (() => {
                        const output = [];

                        el.artists.forEach(el => {
                            output.push(new Artist({ name: el.name }));
                        });

                        return output;
                    })()
                }));
            });

            return tracks;
        })();
    }
}
