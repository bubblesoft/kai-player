/**
 * Created by qhyang on 2017/12/12.
 */

import Set from '../Set';
import Source from '../source/Source';
import Channel from '../source/Channel';
import Track from '../Track';
import Artist from '../Artist';

import config from '../../config';

export default class SourceGroup extends Set {
    async fetch() {
        (await (await fetch(config.urlBase + '/audio/sources', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })).json()).data.forEach(source => {
            const _source = new Source({
                id: source.id,
                name: source.name
            });

            source.channels.forEach(channel => {
                _source.add(new Channel({
                    source: source.id,
                    type: channel.type,
                    name: channel.name
                }))
            });

            this.add(_source);
        });
    }

    async get(index) {
        if (!this._items.length) {
            await this.fetch();
        }

        return super.get(index);
    }

    search(keywords, sources) {
        return (async() => {
            return (await (await fetch(config.urlBase + '/audio/search', {
                method: 'POST',
                body: JSON.stringify({
                    keywords,
                    sources
                }),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            })).json()).data.map(trackData => {
                return new Track({
                    id: trackData.source + '_' + trackData.id,
                    name: trackData.name,
                    duration: trackData.duration || null,
                    artists: trackData.artists.map(artist => new Artist({ name: artist.name }))
                });
            });
        })();
    }
}
