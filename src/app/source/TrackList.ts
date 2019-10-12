/**
 * Created by qhyang on 2017/12/12.
 */

import Artist from "../Artist";
import PlaybackSource from "../PlaybackSource";
import Track from "../Track";
import Source from "./Source";

export default class TrackList {

    public readonly source: Source;
    public readonly id: string;
    public readonly name: string;
    private readonly customGet: (() => Track[]|Promise<Track[]>)|undefined;

    constructor(id: string, name: string, source: Source, { get }: { get?: () => Track[] } = {}) {

        this.id = id;
        this.source = source;
        this.name = name;
        this.customGet = get;
    }

    public async get() {
        if (this.customGet) {
            return await this.customGet();
        }

        return (await (await fetch("/audio/list", {
            method: "POST",

            body: JSON.stringify({
                id: this.id,
                source: this.source.id,
            }),

            headers: new Headers({ "Content-Type": "application/json" }),
        })).json()).data.map((trackData: any) => {
            return new Track(trackData.id, trackData.name, this.source, {
                artists: trackData.artists.map((artist: any) => new Artist({ name: artist.name })),
                duration: trackData.duration,

                picture: (() => {
                    if (!trackData.picture) {
                        return;
                    }

                    return `/proxy/${trackData.picture}`;
                })(),

                playbackSources: trackData.playbackSources && trackData.playbackSources
                        .map((playbackSource: any) => new PlaybackSource(playbackSource.urls, playbackSource.quality)),
            });
        });
    }
}
