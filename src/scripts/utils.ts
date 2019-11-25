/**
 * Created by qhyang on 2017/12/7.
 */

import { Howl } from "howler";
import * as moment from "moment";

import config from "../config";

import Artist from "../app/Artist";
import PlaybackSource from "../app/PlaybackSource";
import Source from "../app/source/Source";
import Track from "../app/Track";

const initHowlOnProgress = (howl: Howl) => {
    // @ts-ignore
    howl._onprogress = [];

    // @ts-ignore
    howl._onstream = [];

    let interval: ReturnType<typeof setInterval>;
    let lastSeek: number;
    let streaming = false;

    howl.on("play", (soundId) => {
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
    });

    howl.on("stop", () => {
        clearInterval(interval);
    });

    howl.on("end", () => {
        clearInterval(interval);
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

const getRecommendedTrack = async (track: Track, sources: Source[]): Promise<Track> => {
    const recommendedTrack = (await (await fetch("/audio/recommend", {
        method: "POST",

        body: JSON.stringify({
            sources: sources.map((source) => source.id),
            track: track ? {
                artists: track.artists.map((artist) => artist.name),
                name: track.name,
            } : null,
        }),

        headers: new Headers({ "Content-Type": "application/json" }),
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

const generateLayout = (type: string, viewportWidth: number, viewportHeight: number) => {
    if (type === "desktop") {
        let width = viewportWidth * .3;

        if (width < 300) {
            width = 300;
        }

        if (width > 600) {
            width = 600;
        }

        return {
            list: { attach: "right", bottomY: viewportHeight * .35, height: viewportHeight * .45, lock: false,
                mode: "bottom", opacity: .4, visible: true, width },
            picture: { autoHide: true, height: Math.min(viewportWidth * .25, 360), lock: false,
                mode: "leftTop", opacity: .4, visible: true, width: Math.min(viewportWidth * .25, 360),
                x: viewportWidth * .03, y: viewportWidth * .03 - 40 },
            playlist: { attach: "right", bottomY: 0, height: viewportHeight * .35, mode: "bottom", opacity: .4,
                visible: true, width },
            search: { attach: "left", bottomY: viewportHeight * .03, height: viewportHeight * .35, lock: false,
                mode: "bottom", opacity: .4, visible: true, width },
            source: { attach: "left", bottomY: viewportHeight * .4, height: 173, lock: false, mode: "bottom",
                opacity: .4, visible: true, width: 258 },
            tracks: { attach: false, bottomY: viewportHeight * .08, height: viewportHeight * .45, lock: false,
                mode: "bottom", opacity: .4, ratioX: .5, visible: true, width: width * 1.1 },
        };
    } else if (type === "mobile") {
        if (viewportHeight < 580) {
            return {
                list: { attach: "left", height: .45, lock: false, mode: "ratio", opacity: .4, visible: true, width: 1,
                    y: .05 },
                picture: { autoHide: true, height: .3, lock: false, mode: "ratio", opacity: .4, visible: false,
                    width: .5, x: .03, y: .03 },
                playlist: { attach: "left", height: .28, lock: false, mode: "ratio", opacity: .4, visible: false,
                    width: 1, y: .42 },
                search: { attach: "left", height: .4, lock: false, mode: "ratio", opacity: .4, visible: false, width: 1,
                    y: 0 },
                source: { attach: "left", height: .3, lock: false, mode: "ratio", opacity: .4, visible: false, width: 1,
                    y: .1 },
                tracks: { attach: "left", height: .5, lock: false, mode: "ratio", opacity: .4, visible: true, width: 1,
                    y: .5 },
            };
        } else {
            return {
                list: { attach: "left", height: .37, lock: false, mode: "ratio", opacity: .4, visible: true, width: 1,
                    y: .05 },
                picture: { autoHide: true, height: .3, lock: false, mode: "ratio", opacity: .4, visible: false,
                    width: .5, x: .03, y: .03 },
                playlist: { attach: "left", height: .28, lock: false, mode: "ratio", opacity: .4, visible: true,
                    width: 1, y: .42 },
                search: { attach: "left", height: .4, lock: false, mode: "ratio", opacity: .4, visible: false, width: 1,
                    y: 0 },
                source: { attach: "left", height: .3, lock: false, mode: "ratio", opacity: .4, visible: false, width: 1,
                    y: .1 },
                tracks: { attach: "left", height: .3, lock: false, mode: "ratio", opacity: .4, visible: true, width: 1,
                    y: .7 },
            };
        }
    }
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

const requestNetworkIdle = (callback: () => void, timeout?: number) => {
    if (!(window as any).serviceWorkerEnabled || !navigator.serviceWorker) {
        return setTimeout(callback, timeout || 0);
    }

    (async () => {
        // @ts-ignore
        const { networkIdleCallback } = await import("network-idle-callback");

        networkIdleCallback(callback, { timeout });
    })();
};

export { initHowlOnProgress, getSourceById, getRecommendedTrack, formatDuration, generateLayout, loadImage, fetchData,
    requestNetworkIdle };
