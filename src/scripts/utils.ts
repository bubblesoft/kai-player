/**
 * Created by qhyang on 2017/12/7.
 */

import { Howl } from "howler";
import * as moment from "moment";

// @ts-ignore
import { networkIdleCallback } from "network-idle-callback";

import config from "../config";

import Artist from "../app/Artist";
import PlaybackSource from "../app/PlaybackSource";
import Source from "../app/source/Source";
import Status from "../app/Status";
import Track from "../app/Track";
import TrackError from "../app/TrackError";
import TrackInfo from "../app/TrackInfo";

const fetchData = async (path: string, options: any = {}) => {
    const res = await (async () => {
        try {
            return await fetch(path, {
                ...options,

                method: "POST",

                headers: new Headers({ "Content-Type": "application/json" }),

                body: JSON.stringify(options.body),
            });
        } catch (e) {
            // console.log(e);

            throw e;
        }
    })();

    const jsonRes = await (async (resToParse) => {
        try {
            return await resToParse.json();
        } catch (e) {
            // console.log(e);

            throw e;
        }
    })(res);

    if (!jsonRes) {
        throw new Error("No response.");
    }

    return jsonRes;
};

const formatDuration = (val: number, formatStr: string) => {
    const prefix = (num: number): string => {
        if (num < 10) {
            return "0" + num;
        } else {
            return String(num);
        }
    };

    const duration = moment.duration(val);

    if (formatStr.match("hh")) {
        formatStr = formatStr.replace("hh", prefix(duration.get("hours")));
        formatStr = formatStr.replace("mm", prefix(duration.get("minutes")));
    } else {
        formatStr = formatStr.replace("mm", prefix(Math.floor(duration.asMinutes())));
    }
    formatStr = formatStr.replace("ss", prefix(duration.get("seconds")));

    return formatStr;
};

const loadImage = (url: string) => {
    return new Promise((resolve, reject) => {
        try {
            const image = new Image();

            image.onload = () => {
                resolve(image);
            };

            image.onerror = (e) => {
                reject(e);
            };

            image.src = url;
        } catch (e) {
            reject(e);
        }
    });
};

const requestNetworkIdle = (callback: () => void, timeout?: number) => {
    if (!(window as any).serviceWorkerEnabled || !navigator.serviceWorker) {
        return setTimeout(callback, timeout || 0);
    }

    (async () => {
        networkIdleCallback(callback, { timeout });
    })();
};

const shorten = async (data: string) => {
    const res = await fetchData("/shorten", { body: { data } });

    if (res.code !== 1) {
        throw new Error(res.message);
    }

    return res.data;
};

const initHowlOnProgress = (howl: Howl) => {
    // @ts-ignore
    howl._onprogress = [];

    // @ts-ignore
    howl._onstream = [];

    let playing = false;
    let streaming = false;
    let interval: ReturnType<typeof setInterval>;
    let lastSeek: number;

    howl.on("play", (soundId) => {
        if (playing) {
            return;
        }

        playing = true;

        interval = setInterval(() => {
            const seek = (() => {
                try {
                    return howl.seek();
                } catch {
                    return undefined;
                }
            })();

            if (!seek) {
                return;
            }

            if (typeof seek !== "number") {
                // @ts-ignore
                howl._emit("progress", soundId, seek);

                streaming = false;

                return;
            }

            if (lastSeek === seek) {
                if (!streaming) {
                    // @ts-ignore
                    howl._emit("stream", soundId, seek);
                }

                streaming = true;
            } else {
                // @ts-ignore
                howl._emit("progress", soundId, seek);

                streaming = false;
            }

            lastSeek = seek;
        }, 100);
    });

    howl.on("pause", () => {
        clearInterval(interval);
        playing = false;
    });

    howl.on("stop", () => {
        clearInterval(interval);
        playing = false;
    });

    howl.on("end", () => {
        clearInterval(interval);
        playing = false;
    });
};

const getSourceById = (() => {
    const unkownSource = new Source("unkown", {
        icons: [config.defaultIcon],
        name: "Unknown Source",
    });

    return (id: string, sources: Source[]) => {
        for (const source of sources) {
            if (source.id === id) {
                return source;
            }
        }

        return unkownSource;
    };
})();

interface IOptions {
    abortSignal?: AbortSignal;
}

const getRecommendedTrack = async (track: Track, sources: Source[], { abortSignal }: IOptions = {}): Promise<Track> => {
    const recommendedTrack = (await (await fetch("/audio/recommend", {
        method: "POST",

        body: JSON.stringify({
            retrievePlaybackSource: true,
            sources: sources.map((source) => source.id),
            track: track ? {
                artists: track.artists.map((artist) => artist.name),
                name: track.name,
            } : null,
            withPlaybackSourceOnly: true,
        }),

        headers: new Headers({ "Content-Type": "application/json" }),
        signal: abortSignal,
    })).json()).data;

    if (!recommendedTrack) {
        await new Promise((resolve) => setTimeout(resolve, 200));

        return await getRecommendedTrack(track, sources);
    }

    return new Track(recommendedTrack.id, recommendedTrack.name, getSourceById(recommendedTrack.source, sources), {
        artists: recommendedTrack.artists.map((artist: any) => new Artist({ name: artist.name })),
        duration: recommendedTrack.duration,

        picture: (() => {
            if (!recommendedTrack.picture) {
                return;
            }

            return `/proxy/${recommendedTrack.picture}`;
        })(),

        playbackSources: recommendedTrack.playbackSources && recommendedTrack.playbackSources
            .map((playbackSource: any) =>
                new PlaybackSource(playbackSource.urls.map((url: string) =>
                    `/proxy/${url}`), playbackSource.quality, {
                    proxied: true,
                    statical: playbackSource.statical,
                }))
            .concat((() => recommendedTrack.playbackSources
                .map((playbackSource: any): PlaybackSource|undefined => playbackSource.cached ?
                    undefined : new PlaybackSource(playbackSource.urls, playbackSource.quality, {
                        proxied: false,
                        statical: playbackSource.statical,
                    }))
                .filter((playbackSource?: PlaybackSource) => playbackSource))()),
        sources,
    });
};

const generateLayout = (type: string, viewportWidth: number, viewportHeight: number) => {
    if (type === "desktop") {
        let width = Math.min(viewportWidth * .3, viewportHeight * .5);

        if (width < 300) {
            width = 300;
        }

        if (width > 600) {
            width = 600;
        }

        return {
            list: { attach: "right", bottomY: viewportHeight * .35, height: viewportHeight * .45, lock: false,
                mode: "bottom", opacity: .5, visible: true, width },
            picture: { autoHide: true, height: Math.min(viewportWidth * .25, 360), lock: false,
                mode: "leftTop", opacity: .5, visible: true, width: Math.min(viewportWidth * .25, 360),
                x: viewportWidth * .03, y: viewportWidth * .03 - 40 },
            playlist: { attach: "right", bottomY: 0, height: viewportHeight * .35, mode: "bottom", opacity: .5,
                visible: true, width },
            search: { attach: "left", bottomY: viewportHeight * .03, height: viewportHeight * .35, lock: false,
                mode: "bottom", opacity: .5, visible: true, width },
            source: { attach: "left", bottomY: viewportHeight * .4, height: 173, lock: false, mode: "bottom",
                opacity: .5, visible: true, width: 258 },
            tracks: { attach: false, bottomY: viewportHeight * .06, height: viewportHeight * .5, lock: false,
                mode: "bottom", opacity: .5, ratioX: .5, visible: true, width: width * 1.2 },
        };
    } else if (type === "mobile") {
        if (viewportHeight < 580) {
            return {
                list: { attach: "left", height: .45, lock: false, mode: "ratio", opacity: .5, visible: false, width: 1,
                    y: .05 },
                picture: { autoHide: true, height: .4, lock: false, mode: "ratio", opacity: .5, visible: false,
                    width: .5, x: .03, y: .03 },
                playlist: { attach: "left", height: .45, lock: false, mode: "ratio", opacity: .5, visible: true,
                    width: 1, y: .05 },
                search: { attach: "left", height: .45, lock: false, mode: "ratio", opacity: .5, visible: false,
                    width: 1, y: .05 },
                source: { attach: "left", height: .45, lock: false, mode: "ratio", opacity: .5, visible: false,
                    width: 1, y: .05 },
                tracks: { attach: "left", height: .5, lock: false, mode: "ratio", opacity: .5, visible: true, width: 1,
                    y: .5 },
            };
        } else {
            return {
                list: { attach: "left", height: .37, lock: false, mode: "ratio", opacity: .5, visible: true, width: 1,
                    y: .05 },
                picture: { autoHide: true, height: .3, lock: false, mode: "ratio", opacity: .5, visible: false,
                    width: .5, x: .03, y: .03 },
                playlist: { attach: "left", height: .28, lock: false, mode: "ratio", opacity: .5, visible: true,
                    width: 1, y: .42 },
                search: { attach: "left", height: .4, lock: false, mode: "ratio", opacity: .5, visible: false, width: 1,
                    y: 0 },
                source: { attach: "left", height: .3, lock: false, mode: "ratio", opacity: .5, visible: false, width: 1,
                    y: .1 },
                tracks: { attach: "left", height: .3, lock: false, mode: "ratio", opacity: .5, visible: true, width: 1,
                    y: .7 },
            };
        }
    }
};

const transformTrackForStringify = (track: Track) => {
    return {
        altPlaybackSources: track.altPlaybackSources.length ? track.altPlaybackSources
            .filter(({ playbackSource }: { playbackSource: PlaybackSource }) =>
                playbackSource.proxied || playbackSource.statical)
            .map((altPlaybackSource: { playbackSource: PlaybackSource; similarity: number }) => ({
                playbackSource: {
                    proxied: altPlaybackSource.playbackSource.proxied,
                    quality: altPlaybackSource.playbackSource.quality,
                    statical: altPlaybackSource.playbackSource.statical,
                    urls: altPlaybackSource.playbackSource.urls,
                },
                similarity: altPlaybackSource.similarity,
            })) : undefined,

        artists: track.artists.map((artist: Artist) => ({ name: artist.name })),
        duration: track.duration,
        id: track.id,

        messages: track.messages && (Array.from(track.messages) as Array<TrackError|TrackInfo>)
            .map((message: TrackError|TrackInfo) => ({
                code: message.code,

                level: (() => {
                    if (message instanceof TrackError) {
                        return "error";
                    } else if (message instanceof TrackInfo) {
                        return "info";
                    } else {
                        return "unknown";
                    }
                })(),
            })),

        name: track.name,
        picture: track.picture,

        playbackSources: track.playbackSources && track.playbackSources.length ? track.playbackSources
            .filter((playbackSource: PlaybackSource) => playbackSource.proxied || playbackSource.statical)
            .map((playbackSource: PlaybackSource) => ({
                proxied: playbackSource.proxied,
                quality: playbackSource.quality,
                statical: playbackSource.statical,
                urls: playbackSource.urls,
            })) : undefined,

        source: track.source.id,
        status: track.status.id,
    };
};

const createTrackFromTrackData = (trackData: any) => {
    return new Track(trackData.id, trackData.name, new Source(trackData.source, { name: trackData.source }), {
        artists: trackData.artists.map((artistData: any) => new Artist({ name: artistData.name })),
        duration: trackData.duration,
        picture: trackData.picture,

        playbackSources: trackData.playbackSources && trackData.playbackSources.length ? trackData.playbackSources
            .map((playbackSource: any) => playbackSource.urls && playbackSource.urls.length
                && new PlaybackSource(playbackSource.urls, playbackSource.quality, {
                    proxied: playbackSource.proxied,
                    statical: playbackSource.statical,
                }))
            .filter((playbackSource: any) => playbackSource) : undefined,

        status: Status.fromId(trackData.status) || undefined,

        messages: trackData.messages && trackData.messages.map((messageData: any) => {
            if (messageData.level === "error") {
                return TrackError.fromCode(messageData.code);
            }

            return TrackInfo.fromCode(messageData.code);
        }),

        altPlaybackSources: trackData.altPlaybackSources && trackData.altPlaybackSources.length ?
            trackData.altPlaybackSources.map(({ playbackSource, similarity }: any) => {
                if (!playbackSource.urls || !playbackSource.urls.length) {
                    return;
                }

                return {
                    playbackSource: new PlaybackSource(playbackSource.urls, playbackSource.quality, {
                        proxied: playbackSource.proxied,
                        statical: playbackSource.statical,
                    }),
                    similarity,
                };
            }).filter((altPlaybackSource: any) => altPlaybackSource) : [],
    });
};

export { fetchData, formatDuration, loadImage, requestNetworkIdle, shorten, initHowlOnProgress, getSourceById,
    getRecommendedTrack, generateLayout, transformTrackForStringify, createTrackFromTrackData };
