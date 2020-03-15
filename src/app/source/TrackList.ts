/**
 * Created by qhyang on 2017/12/12.
 */

import Artist from "../Artist";
import PlaybackSource from "../PlaybackSource";
import Track from "../Track";
import Source from "./Source";

import { generateProxiedUrl } from "../../scripts/utils";

interface IOptions {
    get?: () => Track[];
    sources?: Source[];
}

export default class TrackList {

    public readonly source: Source;
    public readonly id: string;
    public readonly name: string;
    public sources?: Source[];
    private readonly customGet: (() => Track[]|Promise<Track[]>)|undefined;

    constructor(id: string, name: string, source: Source, { get, sources }: IOptions = {}) {

        this.id = id;
        this.source = source;
        this.name = name;
        this.customGet = get;
        this.sources = sources;
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

                    return generateProxiedUrl(trackData.picture);
                })(),

                playbackSources: trackData.playbackSources && trackData.playbackSources
                    .map((p: any) => new PlaybackSource(p.urls.map((u: string) => generateProxiedUrl(u)), p.quality, {
                        live: p.live,
                        proxied: true,
                        statical: p.statical,
                    }))
                    .concat((() => trackData.playbackSources
                        .map((p: any): PlaybackSource|undefined => p.cached ? undefined
                            : new PlaybackSource(p.urls, p.quality, {
                                live: p.live,
                                proxied: false,
                                statical: p.statical,
                            }))
                        .filter((p?: PlaybackSource) => p))()),

                sources: this.sources,
            });
        });
    }
}
