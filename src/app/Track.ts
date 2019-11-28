/**
 * Created by qhyang on 2017/12/11.
 */

import {fetchData, getSourceById} from "../scripts/utils";

import ITrack from "./ITrack";

import Artist from "./Artist";
import Message from "./Message";
import PlaybackSource from "./PlaybackSource";
import Source from "./source/Source";
import Status from "./Status";

import config from "../config";

interface IOptions {
    artists: Artist[];
    status?: Status;
    playbackSources?: PlaybackSource[];
    picture?: string;
    duration?: number;
    messages?: Message[];
    altPlaybackSources?: Array<{ playbackSource: PlaybackSource, similarity: number }>;
    getPlaybackSources?: (track: Track) => Promise<PlaybackSource[]>;
    sources?: Source[];
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
    public static fetchTimeoutError = new Error("Fetch timeout.");
    private static preloadFailError = new Error("Source preload failed.");

    public readonly id: string;
    public readonly name: string;
    public readonly artists: Artist[];
    public readonly source: Source|string;
    public readonly messages: Set<Message> = new Set();
    public readonly picture?: string;
    public status: Status;
    public duration?: number;
    public playbackSources: PlaybackSource[] = [];
    public readonly altPlaybackSources: IAltPlaybackSource[] = [];
    public preference?: any;
    public sources: Source[] = [];
    private readonly getPlaybackSources?: () => Promise<PlaybackSource[]>;
    private preloaded = false;

    constructor(id: string, name: string, source: Source, {
        artists,
        picture,
        status,
        playbackSources,
        duration,
        messages,
        altPlaybackSources,
        getPlaybackSources,
        sources,
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

        if (sources) {
            this.sources = sources;
        }
    }

    public async preload({ abortSignal }: { abortSignal?: AbortSignal } = {}) {
        const abortControllers = new Map<string, AbortController>();

        if (abortSignal) {
            if (abortSignal.aborted) {
                return this.preloaded;
            }

            abortSignal.addEventListener("abort", () => {
                for (const abortController of abortControllers.values()) {
                    abortController.abort();
                }
            });
        }

        if (this.preloaded) {
            return true;
        }

        const preloadPlaybackSources = async (playbackSources: PlaybackSource[]): Promise<void> => {
            const audios = playbackSources
                .filter((source) => !source.proxied)
                .flatMap((source) => source.urls)

                .map((url) => {
                    const audio = new Audio();

                    audio.preload = "auto";
                    audio.src = url;

                    return audio;
                });

            audios.forEach((audio) => {
                audio.addEventListener("canplay", () => {
                    audios.forEach((otherAudio) => {
                        if  (otherAudio !== audio) {
                            otherAudio.removeAttribute("src");
                            otherAudio.load();
                        }
                    });
                });
            });

            const proxiedUrls = playbackSources
                .filter((playbackSource) => playbackSource.proxied)
                .flatMap((playbackSource) => playbackSource.urls);

            // @ts-ignore
            return await Promise.any(proxiedUrls.map(async (proxiedUrl) => {
                const abortController = new AbortController();

                abortControllers.set(proxiedUrl, abortController);

                const res = await fetch(proxiedUrl, { signal: abortController.signal });

                if (!res.ok) {
                    throw Track.preloadFailError;
                }

                proxiedUrls.forEach((otherUrl) => {
                    if (otherUrl !== proxiedUrl) {
                        const otherAbortController = abortControllers.get(otherUrl);

                        if (otherAbortController) {
                            otherAbortController.abort();
                        }
                    }
                });

                return;
            }));
        };

        // const preference = this.preference || config.defaultPreference;
        //
        // if (!this.playbackSources.filter((source) => source.generated).length) {
        //     this.playbackSources.push(new PlaybackSource(this.generateStreamUrl({
        //         quality: 0,
        //         similarityRange: {
        //             high: preference.playback.alternativeTracks.similarityRange.high,
        //             low: preference.playback.alternativeTracks.similarityRange.low,
        //         },
        //         timeToWait: preference.playback.timeToWait,
        //     }), 0, {
        //         generated: true,
        //         proxied: true,
        //     }));
        // }

        const loadPlaybackSourcesPromise =  this.loadPlaybackSources();
        const getAltTracksPromise = this.getAltTracks();

        const preloadPlaybackSourcesPromise1 = (async () => {
            await loadPlaybackSourcesPromise;

            return await preloadPlaybackSources(this.playbackSources);
        })();

        const preloadPlaybackSourcesPromise2 = (async () => {
            const altTracks = await (async () => {
                try {
                    return await getAltTracksPromise;
                } catch (e) {
                    // console.log(e);

                    return [];
                }
            })();

            // @ts-ignore
            return await Promise.any(altTracks.map(async (altTrack: Track) => {
                await altTrack.loadPlaybackSources();

                return await preloadPlaybackSources(altTrack.playbackSources);
            }));
        })();

        // @ts-ignore
        try {
            // @ts-ignore
            await Promise.any([preloadPlaybackSourcesPromise1, preloadPlaybackSourcesPromise2]);

            this.preloaded = true;
        } catch (e) {
            // console.log(e);
        }

        return this.preloaded;
    }

    public async loadPlaybackSources({ timeout = 0, abortSignal }:
        { timeout?: number, abortSignal?: AbortSignal } = {}) {
        const data = await (() => {
            const abortController = new AbortController();

            const fetchPromise = (async () => {
                return (await (await fetch("/audio/playbacksources", {
                    method: "POST",

                    headers: new Headers({ "Content-Type": "application/json" }),

                    body: JSON.stringify({
                        id: this.id,
                        source: this.source instanceof Source ? this.source.id : this.source,
                    }),

                    signal: abortController.signal,
                })).json()).data;
            })();

            let timeoutId: ReturnType<typeof setTimeout>|null = null;

            const timeoutPromise = timeout ? new Promise((resolve, reject) => {
                timeoutId = setTimeout(() => {
                    reject(Track.fetchTimeoutError);
                }, timeout);
            }) : undefined;

            (async () => {
                try {
                    await fetchPromise;

                    if (timeoutId !== null) {
                        clearTimeout(timeoutId);
                    }
                } catch (e) {
                    // console.log(e);
                }
            })();

            (async () => {
                try {
                    await timeoutPromise;
                } catch {
                    abortController.abort();
                }
            })();

            return timeoutPromise ? Promise.race([fetchPromise, timeoutPromise]) : fetchPromise;
        })();

        const playbackSources = await (async () => {
            if (this.getPlaybackSources) {
                return await this.getPlaybackSources();
            }

            return data && data
                .map((playbackSource: any): PlaybackSource|undefined => playbackSource.cached ? undefined
                    : new PlaybackSource(playbackSource.urls, playbackSource.quality, {
                        proxied: false,
                        statical: playbackSource.statical,
                    }))
                .filter((playbackSource?: PlaybackSource) => playbackSource);
        })();

        const hasProxied = Boolean(this.playbackSources.filter((source) => source.proxied && !source.generated).length);

        if (playbackSources && playbackSources.length) {
            if (!hasProxied) {
                this.playbackSources.push(...playbackSources.map((playbackSource: PlaybackSource) =>
                    new PlaybackSource(playbackSource.urls
                        .map((url: string) => `/proxy/${url}`), playbackSource.quality, {
                        proxied: true,
                        statical: playbackSource.statical,
                    })));
            }

            for (const playbackSource of playbackSources) {
                if (!this.hasPlaybackSource(playbackSource)) {
                    this.playbackSources.push(playbackSource);
                }
            }
        }

        const cachedPlaybackSources = await (async () => {
            if (this.getPlaybackSources) {
                return await this.getPlaybackSources();
            }

            return data && data
                .map((playbackSource: any): PlaybackSource|undefined => !playbackSource.cached ? undefined
                    : new PlaybackSource(playbackSource.urls, playbackSource.quality, {
                        proxied: false,
                        statical: playbackSource.statical,
                    }))
                .filter((playbackSource?: PlaybackSource) => playbackSource);
        })();

        if (cachedPlaybackSources && cachedPlaybackSources.length) {
            if (!hasProxied) {
                this.playbackSources.push(...cachedPlaybackSources.map((playbackSource: PlaybackSource) =>
                    new PlaybackSource(playbackSource.urls
                        .map((url: string) => `/proxy/${url}`), playbackSource.quality, {
                        proxied: true,
                        statical: playbackSource.statical,
                    })));
            }
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

    public hasPlaybackSource(playbackSource: PlaybackSource) {
        return this.playbackSources.reduce((matched, existingPlaybackSource) => {
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

    public generateStreamUrl({ quality, timeToWait, sources, similarityRange }: IStreamUrlOptions = {}) {
        const baseUrl = "/audio/stream";
        const id = this.id;
        const sourceId = this.source instanceof Source ? this.source.id : this.source;

        const options = {
            alternativeTracks: {
                exceptedSources: [this.source instanceof Source ? this.source.id : this.source],
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

    public async getAltTracks(): Promise<Track[]> {
        const preference = this.preference || config.defaultPreference;

        const res = await fetchData("/audio/alttracks", {
            body: {
                artists: this.artists.map((artist) => artist.name),
                // exceptedSources: [this.source instanceof Source ? this.source.id : this.source],
                exceptedTracks: [this.id],
                name: this.name,
                retrievePlaybackSource: true,
                similarityRange: {
                    high: preference.playback.alternativeTracks.similarityRange.high,
                    low: preference.playback.alternativeTracks.similarityRange.low,
                },
                timeout: preference.playback.timeout,
                withPlaybackSourceOnly: true,
            },
        });

        if (res.code !== 1 || !res.data || !res.data.length) {
            return [];
        }

        return res.data.map(({ id, name, artists, source, picture, duration, playbackSources }: any) =>
            new Track(id, name, this.sources && this.sources.length ? getSourceById(source, this.sources) : source, {
                artists: artists.map((artist: any) => new Artist({ name: artist.name })),
                duration,

                picture: (() => {
                    if (!picture) {
                        return;
                    }

                    return `/proxy/${picture}`;
                })(),

                playbackSources: playbackSources && playbackSources
                    .map((playbackSource: any) =>
                        new PlaybackSource(playbackSource.urls.map((url: string) =>
                            `/proxy/${url}`), playbackSource.quality, {
                            proxied: true,
                            statical: playbackSource.statical,
                        }))
                    .concat((() => playbackSources
                        .map((playbackSource: any): PlaybackSource|undefined => playbackSource.cached ?
                            undefined : new PlaybackSource(playbackSource.urls, playbackSource.quality, {
                                proxied: false,
                                statical: playbackSource.statical,
                            }))
                        .filter((playbackSource?: PlaybackSource) => playbackSource))()),

                sources: this.sources,
            }));
    }
}
