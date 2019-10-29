/**
 * Created by qhyang on 2017/12/11.
 */

import ITrack from "./ITrack";

import Artist from "./Artist";
import Message from "./Message";
import PlaybackSource from "./PlaybackSource";
import Source from "./source/Source";
import Status from "./Status";

interface IOptions {
    artists: Artist[];
    status?: Status;
    playbackSources?: PlaybackSource[];
    picture?: string;
    duration?: number;
    messages?: Message[];
    altPlaybackSources?: Array<{ playbackSource: PlaybackSource, similarity: number }>;
    getPlaybackSources?: (track: Track) => Promise<PlaybackSource[]>;
}

interface IAltPlaybackSource {
    playbackSource: PlaybackSource;
    similarity: number;
}

interface IStreamUrlOptions {
    quality?: number;
    timeToWait?: number;
    sources?: Source[];
    similarityRange?: {
        high: number,
        low: number,
    };
}

export default class Track implements ITrack {
    public readonly id: string;
    public readonly name: string;
    public readonly artists: Artist[];
    public readonly source: Source;
    public readonly messages: Set<Message> = new Set();
    public readonly picture?: string;
    public status: Status;
    public duration?: number;
    public playbackSources: PlaybackSource[] = [];
    public readonly altPlaybackSources: IAltPlaybackSource[] = [];
    private readonly getPlaybackSources?: () => Promise<PlaybackSource[]>;

    constructor(id: string, name: string, source: Source, {
        artists,
        picture,
        status,
        playbackSources,
        duration,
        messages,
        altPlaybackSources,
        getPlaybackSources,
    }: IOptions) {
        this.id = id;
        this.name = name;
        this.artists = artists;
        this.source = source;
        this.picture = picture;
        this.status = status || Status.Ok;

        if (playbackSources && playbackSources.length) {
            this.playbackSources = playbackSources;
        }

        this.duration = duration;

        if (messages) {
            for (const message of messages) {
                this.messages.add(message);
            }
        }

        if (altPlaybackSources) {
            this.altPlaybackSources = altPlaybackSources;
        }

        if (getPlaybackSources) {
            this.getPlaybackSources = async () => await getPlaybackSources(this);
        }
    }

    public async loadPlaybackSources() {
        const playbackSources = await (async () => {
            if (this.getPlaybackSources) {
                return await this.getPlaybackSources();
            }

            const data = (await (await fetch("/audio/playbacksources", {
                method: "POST",

                headers: new Headers({ "Content-Type": "application/json" }),

                body: JSON.stringify({
                    id: this.id,
                    source: this.source.id,
                }),
            })).json()).data;

            return data && data
                .map((playbackSource: any): PlaybackSource|undefined => playbackSource.cached ? undefined
                    : new PlaybackSource(playbackSource.urls, playbackSource.quality, false))
                .filter((playbackSource?: PlaybackSource) => playbackSource);
        })();

        if (playbackSources && playbackSources.length) {
            if (!this.playbackSources.filter((playbackSource) => playbackSource.proxied).length) {
                this.playbackSources.push(...playbackSources.map((playbackSource: PlaybackSource) =>
                    new PlaybackSource(playbackSource.urls
                        .map((url: string) => `/proxy/${url}`), playbackSource.quality, true)));
            }

            for (const playbackSource of playbackSources) {
                const samePlaybackSourceExisting = this.playbackSources.reduce((matched, existingPlaybackSource) => {
                    if (matched === true) {
                        return matched;
                    }

                    for (const url of playbackSource.urls) {
                        if (existingPlaybackSource.urls.includes(url)) {
                            return true;
                        }
                    }

                    return matched;
                }, false);

                if (!samePlaybackSourceExisting) {
                    this.playbackSources.push(playbackSource);
                }
            }
        }

        if (this.playbackSources && !this.playbackSources.length) {
            delete this.playbackSources;
        }

        return this.playbackSources;
    }

    public removePlaybackSource(playbackSource: PlaybackSource) {
        for (let i = 0; i < this.playbackSources.length; i++) {
            const existingPlaybackSource = this.playbackSources[i];

            if (existingPlaybackSource === playbackSource) {
                this.playbackSources.splice(i, 1);

                break;
            }
        }
    }

    public addAltPlaybackSources(altPlaybackSources: IAltPlaybackSource[]|IAltPlaybackSource) {
        for (const altPlaybackSource of Array.isArray(altPlaybackSources) ? altPlaybackSources : [altPlaybackSources]) {
            const samePlaybackSourceExisting = this.altPlaybackSources.reduce((matched, existingAltPlaybackSource) => {
                if (matched === true) {
                    return matched;
                }

                if (altPlaybackSource.similarity !== existingAltPlaybackSource.similarity) {
                    return false;
                }

                for (const url of  altPlaybackSource.playbackSource.urls) {
                    if (existingAltPlaybackSource.playbackSource.urls.includes(url)) {
                        return true;
                    }
                }

                return matched;
            }, false);

            if (!samePlaybackSourceExisting) {
                this.altPlaybackSources.push(altPlaybackSource);
            }
        }
    }

    public removeAltPlaybackSource(altPlaybackSource: IAltPlaybackSource) {
        for (let i = 0; i < this.altPlaybackSources.length; i++) {
            const existingAltPlaybackSource = this.altPlaybackSources[i];

            if (existingAltPlaybackSource === altPlaybackSource) {
                this.altPlaybackSources.splice(i, 1);

                break;
            }
        }
    }

    public generateStreamUrl({ quality, timeToWait, sources, similarityRange }: IStreamUrlOptions = {}): string {
        const baseUrl = "/audio/stream";
        const id = this.id;
        const sourceId = this.source.id;

        const options = {
            alternativeTracks: {
                exceptedSources: [this.source.id],
                similarityRange: similarityRange && {
                    high: similarityRange.high,
                    low: similarityRange.low,
                },
                sources: sources && sources.map((source) => source.id),
                track: {
                    artists: this.artists.map((artist) => artist.name),
                    name: this.name,
                },
            },
            quality,
            timeToWait,
        };

        return `${baseUrl}/${id}/${sourceId}/${JSON.stringify(options)}`;
    }
}
