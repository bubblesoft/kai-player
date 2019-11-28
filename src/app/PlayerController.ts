/**
 * Created by qhyang on 2018/5/2.
 */

import config from "../config";

import {fetchData, getSourceById, requestNetworkIdle} from "../scripts/utils";

import IPlayerController from "./IPlayerController";

import Artist from "./Artist";
import PlaybackSource from "./PlaybackSource";
import Player from "./Player";
import PlayerStatus from "./PlayerStatus";
import Source from "./source/Source";
import Status from "./Status";
import Track from "./Track";
import TrackError from "./TrackError";
import TrackInfo from "./TrackInfo";

export default class PlayerController implements IPlayerController {
    private static noPlayerError = new Error("No player connected.");

    public player: Player|null = null;
    public visualizer: any|null;
    public background: any|null;
    public preference?: any;

    public get status() {
        if (this.loading) {
            return PlayerStatus.Loading;
        }

        if (!this.player) {
            return PlayerStatus.Unloaded;
        }

        return this.player.status;
    }

    public get duration() {
        if (!this.player) {
            return 0;
        }

        return this.player.duration;
    }

    public get progress() {
        if (!this.player) {
            return 0;
        }

        return this.player.progress;
    }

    public set progress(progress) {
        if (this.player) {
            this.player.progress = progress;
        }
    }

    public get volume() {
        if (!this.player) {
            return 0;
        }

        return this.player.volume;
    }

    public set volume(volume) {
        if (this.player) {
            this.player.volume = volume;
        }
    }

    public expectedPlaybackQuality = 0;
    public sources: Source[] = [];

    public get usingAltTrack() {
        return this.privateUsingAltTrack;
    }

    private track?: Track;
    private privateUsingAltTrack = false;
    private loading = false;
    private resolveExistingLoadingPromise?: (() => void);
    private resolveExistingPlayTrackPromise?: (() => void);
    private altTracks: Track[] = [];
    private previousPlaying = false;
    private playbackId = 0;
    private timeouts: Array<ReturnType<typeof setTimeout>> = [];
    private hasTrackAddedToPlayer = false;
    private onRacerFailCallback?: (url: string) => void;
    private onEndCallback?: () => void;
    private onPlayErrorCallback?: (soundId: number, err: Error) => void;
    private onLoadErrorCallback?: (soundId: number, err: Error) => void;
    private onLoadCallback?: (loadedUrl: string) => void;
    private originSourceFailed = false;
    private proxiedOriginSourceFailed = false;
    private stoppedJoinRace = false;
    private timeout = false;
    private abortController = new AbortController();

    private get active() {
        return this.status === PlayerStatus.Playing
            || this.status === PlayerStatus.Streaming
            || this.status === PlayerStatus.Paused;
    }

    public playTrack(track: Track, callback?: () => void) {
        this.unwatchPlayer();
        this.stopLoading();
        this.track = track;
        this.playbackId = new Date().getTime();
        this.hasTrackAddedToPlayer = false;
        this.originSourceFailed = false;
        this.proxiedOriginSourceFailed = false;
        this.stoppedJoinRace = false;
        this.timeout = false;
        this.abortController = new AbortController();

        return new Promise<void>((resolvePlayback, rejectPlayback) => {
            if (this.resolveExistingLoadingPromise) {
                this.resolveExistingLoadingPromise();
            }

            this.resolveExistingLoadingPromise = () => {
                delete this.resolveExistingLoadingPromise;
            };

            if (this.resolveExistingPlayTrackPromise) {
                this.resolveExistingPlayTrackPromise();
            }

            this.resolveExistingPlayTrackPromise = () => {
                delete this.resolveExistingPlayTrackPromise;

                resolvePlayback();
            };

            this.previousPlaying = this.player ?
                this.player.status === PlayerStatus.Playing || this.player.status === PlayerStatus.Streaming
                : false;

            this.loading = true;
            this.privateUsingAltTrack = false;

            try {
                if (this.background) {
                    this.background.loadResource({ picture: track.picture });
                }

                if (this.visualizer) {
                    this.visualizer.loadResource({ picture: track.picture });
                }

                if (!this.player) {
                    throw PlayerController.noPlayerError;
                }

                this.player.unload();
                this.watchPlayer(resolvePlayback, rejectPlayback, callback);
                this.altTracks = [];
                this.playbackId = new Date().getTime();
                this.loadTrack(track, resolvePlayback, rejectPlayback);
            } catch (e) {
                // console.log(e);

                this.loading = true;
                rejectPlayback(e);

                if (this.resolveExistingPlayTrackPromise) {
                    this.resolveExistingLoadingPromise();
                }
            }
        });
    }

    public pause() {
        if (!this.player) {
            return 0;
        }

        this.player.pause();

        setTimeout(() => setTimeout(async () => {
            await this.background.event("pause");
            await this.background.event("reset");
        }, 0), 0);

        return this.player.progress;
    }

    public stop() {
        this.stopLoading();

        if (this.player) {
            this.player.stop();
        }

        if (this.resolveExistingPlayTrackPromise) {
            this.resolveExistingPlayTrackPromise();
        }

        this.privateUsingAltTrack = false;
    }

    private loadTrack(track: Track, resolvePlayback: (value?: any) => void, rejectPlayback: (reason?: Error) => void) {
        if (!this.player) {
            throw PlayerController.noPlayerError;
        }

        let aborted = false;

        const resolveExistingLoadingPromise = this.resolveExistingLoadingPromise;

        this.resolveExistingLoadingPromise = () => {
            if (resolveExistingLoadingPromise) {
                resolveExistingLoadingPromise();
            }

            aborted = true;
        };

        this.player.startRace(this.playbackId);

        const preference = this.preference || config.defaultPreference;

        const loadPlaybackSourcesPromise = (async () => {
            const fetchPlaybackSources = async () => {
                const playbackSources = await (async () => {
                    try {
                        return await track.loadPlaybackSources({
                            abortSignal: this.abortController.signal,
                            timeout: preference.playback.timeout,
                        });
                    } catch (e) {
                        if (e === Track.fetchTimeoutError) {
                            if (track !== this.track || !this.active) {
                                if (track.status !== Status.Error) {
                                    track.status = Status.Warning;

                                    if (track.status !== Status.Warning) {
                                        track.messages.clear();
                                    }

                                    track.messages.add(TrackInfo.SLOW_CONNECTION);
                                }
                            }
                        }

                        if (aborted) {
                            return;
                        }

                        if (e === Track.fetchTimeoutError) {
                            this.timeout = true;

                            return track.playbackSources;
                        }

                        // console.log(e);

                        if (track.status !== Status.Error) {
                            track.status = Status.Warning;

                            if (track.status !== Status.Warning) {
                                track.messages.clear();
                            }

                            track.messages.add(TrackInfo.USTABLE_CONNECTION);
                        }
                    }
                })();

                if (aborted) {
                    return;
                }

                if (playbackSources && playbackSources.length) {
                    this.loadPlaybackSources(playbackSources);
                } else if (!this.timeout) {
                    track.status = Status.Error;
                    track.messages.clear();
                    track.messages.add(TrackError.NO_AVAILABLE_SOURCE);
                }
            };

            try {
                if (!track.playbackSources || !track.playbackSources.filter((s) => !s.proxied).length) {
                    await fetchPlaybackSources();

                    return;
                }

                this.loadPlaybackSources(track.playbackSources);

                // await new Promise<void>((resolve, reject) => {
                //     requestNetworkIdle(async () => {
                //         try {
                //             resolve(await fetchPlaybackSources());
                //         } catch (e) {
                //             reject(e);
                //         }
                //     }, timeToWait);
                // });
            } catch (e) {
                // console.log(e);
            }
        })();

        const timeToWait = preference.playback.timeToWait;

        if (!preference.playback.alternativeTracks.enable) {
            return;
        }

        const loadAltTracks = () => {
            const timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(Track.fetchTimeoutError);
                }, preference.playback.timeout);
            });

            const altTracksResPromises = (() => {
                return this.sources
                // .filter((source) => source !== track.source)
                    .map((source) => Promise.race([fetchData("/audio/alttracks", {
                        body: {
                            artists: track.artists.map((artist) => artist.name),
                            exceptedTracks: [track.id],
                            name: track.name,
                            retrievePlaybackSource: true,
                            similarityRange: {
                                high: preference.playback.alternativeTracks.similarityRange.high,
                                low: preference.playback.alternativeTracks.similarityRange.low,
                            },
                            sources: [source.id],
                            timeout: preference.playback.timeout,
                            withPlaybackSourceOnly: true,
                        },
                        signal: this.abortController.signal,
                    }), timeoutPromise]));
            })();

            return Promise.all(altTracksResPromises.map(async (altTracksResPromise) => {
                try {
                    const res = await altTracksResPromise;

                    if (res.code !== 1 || !res.data || !res.data.length) {
                        return;
                    }

                    const altTracks = res.data.map(({ id, name, artists, source, picture, duration,
                        playbackSources }: any) => new Track(id, name, getSourceById(source, this.sources), {
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

                    if (aborted) {
                        return;
                    }

                    if (!altTracks || !altTracks.length) {
                        return;
                    }

                    this.altTracks.push(...altTracks);

                    const similarities = res.data.map(({ similarity }: any) => similarity);

                    await Promise.all(altTracks.map(async (altTrack: Track, i: number) => {
                        try {
                            const altTrackPlaybackSources = await (async () => {
                                if (altTrack.playbackSources && altTrack.playbackSources.length) {
                                    return altTrack.playbackSources.map((playbackSource) => ({
                                        playbackSource,
                                        similarity: similarities[i],
                                    }));
                                }

                                const playbackSources = await (async () => {
                                    try {
                                        return await altTrack.loadPlaybackSources({
                                            abortSignal: this.abortController.signal,
                                            timeout: preference.playback.timeout,
                                        });
                                    } catch (e) {
                                        if (e === Track.fetchTimeoutError) {
                                            return;
                                        }

                                        // console.log(e);
                                    }
                                })();

                                if (!playbackSources || !playbackSources.length) {
                                    return;
                                }

                                return playbackSources.map((playbackSource) => ({
                                    playbackSource,
                                    similarity: similarities[i],
                                }));
                            })();

                            if (aborted) {
                                return;
                            }

                            if (!altTrackPlaybackSources || !altTrackPlaybackSources.length) {
                                return;
                            }

                            track.addAltPlaybackSources(altTrackPlaybackSources);

                            altTrackPlaybackSources.forEach(({ playbackSource, similarity }) => {
                                if (!track.hasPlaybackSource(playbackSource)) {
                                    this.timeouts.push(setTimeout(() =>
                                        this.loadPlaybackSources([playbackSource]), (1 - similarity) * timeToWait));
                                }
                            });
                        } catch (e) {
                            // console.log(e);
                        }
                    }));
                } catch (e) {
                    // console.log(e);
                }
            }));
        };

        const altPlaybackSources = [...track.altPlaybackSources];
        const hasAltPlaybackSource = Boolean(altPlaybackSources && altPlaybackSources.length);
        const hasOriginAltPlaybackSource = Boolean(altPlaybackSources.filter((a) => !a.playbackSource.proxied).length);
        const loadAltTracksPromise = hasOriginAltPlaybackSource ? Promise.resolve() : loadAltTracks();

        this.timeouts.push(setTimeout(async () => {
            this.timeouts.push(setTimeout(async () => {
                if (track.status !== Status.Error) {
                    track.status = Status.Warning;

                    if (track.status !== Status.Warning) {
                        track.messages.clear();
                    }

                    track.messages.add(TrackInfo.SLOW_CONNECTION);
                }
            }, timeToWait));

            if (hasAltPlaybackSource) {
                altPlaybackSources.forEach(({ playbackSource, similarity }) => this.timeouts.push(setTimeout(() =>
                    this.loadPlaybackSources([playbackSource]), (1 - similarity) * timeToWait)));
            }

            try {
                await loadPlaybackSourcesPromise;
            } catch (e) {
                // console.log(e);
            }

            if (aborted) {
                return;
            }

            await loadAltTracksPromise;

            if (aborted) {
                return;
            }

            this.timeouts.push(setTimeout(async () => {
                if (!this.player) {
                    throw PlayerController.noPlayerError;
                }

                this.player.stopJoinRace();
                this.stoppedJoinRace = true;

                if (!this.hasTrackAddedToPlayer) {
                    this.stopLoading();

                    if (this.resolveExistingLoadingPromise) {
                        this.resolveExistingLoadingPromise();
                    }

                    if (this.active) {
                        return;
                    }

                    this.loading = true;
                    rejectPlayback(new Error("No playback source available."));
                }

                const hasOriginSource = Boolean(track && track.playbackSources.filter((p) => !p.proxied).length);
                const hasProxiedOriginSource = Boolean(track && track.playbackSources.filter((p) => p.proxied).length);

                const originFailed = (!hasOriginSource || this.originSourceFailed)
                    && (!hasProxiedOriginSource || this.proxiedOriginSourceFailed);

                if (this.timeout || originFailed) {
                    this.timeouts.push(setTimeout(() => {
                        if (this.active) {
                            return;
                        }

                        this.loading = true;
                        rejectPlayback(new Error("Loading timeout."));
                    }, timeToWait));
                }
            }, timeToWait));
        }, timeToWait));
    }

    private stopLoading() {
        if (this.resolveExistingLoadingPromise) {
            this.resolveExistingLoadingPromise();
        }

        for (const timeout of this.timeouts) {
            clearTimeout(timeout);
        }

        if (this.player) {
            this.player.stopRace();
        }

        this.abortController.abort();
        this.loading = false;
    }

    private watchPlayer(resolvePlayback: (value?: any) => void, rejectPlayback: (reason?: Error) => void,
                        callback?: () => void) {
        this.unwatchPlayer();

        let aborted = false;

        const resolveExistingLoadingPromise = this.resolveExistingLoadingPromise;

        this.resolveExistingLoadingPromise = () => {
            if (resolveExistingLoadingPromise) {
                resolveExistingLoadingPromise();
            }

            aborted = true;
        };

        if (!this.player) {
            throw PlayerController.noPlayerError;
        }

        const track = this.track;

        let originSourceFailed = false;
        let proxiedOriginSourceFailed = false;

        this.onRacerFailCallback = (url: string) => {
            const rejectPlaybackAfterMilliseconds = (milliseconds: number) => {
                this.timeouts.push(setTimeout(() => {
                    if (this.active) {
                        return;
                    }

                    this.loading = true;
                    rejectPlayback();
                }, milliseconds));
            };

            const preference = this.preference || config.defaultPreference;
            const timeToWait = preference.playback.timeToWait;

            if (!track || !track.playbackSources || !track.playbackSources.length) {
                rejectPlaybackAfterMilliseconds(timeToWait);

                return;
            }

            const matchedSources = track.playbackSources.filter((playbackSource) => playbackSource.urls.includes(url));

            if (matchedSources.length) {
                matchedSources.forEach((playbackSource) => {
                    if (playbackSource.proxied) {
                        proxiedOriginSourceFailed = true;

                        if (!aborted) {
                            this.proxiedOriginSourceFailed = true;
                        }

                        return;
                    }

                    originSourceFailed = true;

                    if (!aborted) {
                        this.originSourceFailed = true;
                    }
                });
            }

            const hasOriginSource = Boolean(track && track.playbackSources.filter((p) => !p.proxied).length);
            const hasProxiedOriginSource = Boolean(track && track.playbackSources.filter((p) => p.proxied).length);

            if ((!hasOriginSource || originSourceFailed) && (!hasProxiedOriginSource || proxiedOriginSourceFailed)) {
                track.status = Status.Error;
                track.messages.clear();
                track.messages.add(TrackError.SOURCE_NOT_VALID);

                if (!aborted) {
                    if (this.stoppedJoinRace) {
                        rejectPlaybackAfterMilliseconds(timeToWait);
                    }
                }
            }

            for (const playbackSource of track.playbackSources.filter((source) => !source.statical)) {
                if (playbackSource.urls.includes(url)) {
                    track.removePlaybackSource(playbackSource);
                }
            }

            for (const altPlaybackSource of track.altPlaybackSources) {
                if (altPlaybackSource.playbackSource.urls.includes(url)) {
                    track.removeAltPlaybackSource(altPlaybackSource);
                }
            }

            if (aborted) {
                if (!this.player) {
                    throw PlayerController.noPlayerError;
                }

                if (this.onRacerFailCallback) {
                    this.player.off("racerfail", this.onRacerFailCallback);
                }

                return;
            }
        };

        this.player.on("racerfail", this.onRacerFailCallback);

        this.onEndCallback = () => {
            this.loading = true;
            rejectPlayback();
        };

        this.player.once("end", this.onEndCallback);

        this.onPlayErrorCallback = (soundId, err) => {
            this.loading = true;
            rejectPlayback(err);

            if (this.resolveExistingLoadingPromise) {
                this.resolveExistingLoadingPromise();
            }
        };

        this.player.once("playerror", this.onPlayErrorCallback);

        this.onLoadErrorCallback = (soundId, err) => {
            this.loading = true;
            rejectPlayback(err);
            this.stopLoading();

            if (this.resolveExistingLoadingPromise) {
                this.resolveExistingLoadingPromise();
            }
        };

        this.player.once("loaderror", this.onLoadErrorCallback);

        this.onLoadCallback = (loadedUrl) => {
            if (aborted) {
                return;
            }

            this.stopLoading();

            if (!this.player) {
                throw PlayerController.noPlayerError;
            }

            if (track) {
                const isOriginSource = track.playbackSources && track.playbackSources
                    .map((playbackSource) => playbackSource.urls)
                    .flat()
                    .reduce((matched, playbackSourceUrl) => matched || playbackSourceUrl === loadedUrl, false);

                if (isOriginSource) {
                    track.duration = this.player.duration * 1000;
                    track.status = Status.Ok;
                    track.messages.clear();
                } else {
                    this.privateUsingAltTrack = true;
                }
            }

            if (!this.player) {
                throw PlayerController.noPlayerError;
            }

            if (!this.previousPlaying) {
                this.background.event("play");
            }

            this.player.play();
            this.loading = false;

            if (/^\/proxy/.test(loadedUrl)) {
                // @ts-ignore
                this.visualizer.listen(this.player.sound._sounds[0]._node);
            }

            if (callback) {
                callback();
            }
        };

        this.player.once("load", this.onLoadCallback);
    }

    private unwatchPlayer() {
        if (!this.player) {
            throw PlayerController.noPlayerError;
        }

        if (this.onRacerFailCallback) {
            this.player.off("racerfail", this.onRacerFailCallback);
            delete this.onRacerFailCallback;
        }

        if (this.onEndCallback) {
            this.player.off("end", this.onEndCallback);
            delete this.onEndCallback;
        }

        if (this.onPlayErrorCallback) {
            this.player.off("playerror", this.onPlayErrorCallback);
            delete this.onPlayErrorCallback;
        }

        if (this.onLoadErrorCallback) {
            this.player.off("loaderror", this.onLoadErrorCallback);
            delete this.onLoadErrorCallback;
        }

        if (this.onLoadCallback) {
            this.player.off("load", this.onLoadCallback);

            delete this.onLoadCallback;
        }
    }

    private loadPlaybackSources(playbackSources: PlaybackSource[]) {
        const timeToWait = (this.preference || config.defaultPreference).playback.timeToWait;

        const loadFilteredPlaybackSources = (filteredPlaybackSources: PlaybackSource[]) => {
            filteredPlaybackSources.forEach((playbackSource) => {
                this.timeouts.push(setTimeout(() => {
                    if (!this.player) {
                        throw PlayerController.noPlayerError;
                    }

                    this.player.joinRace(playbackSource.urls, this.playbackId);
                    this.hasTrackAddedToPlayer = true;
                }, Math.abs(this.expectedPlaybackQuality - playbackSource.quality) * timeToWait));
            });
        };

        loadFilteredPlaybackSources(playbackSources.filter((playbackSource) => playbackSource.proxied));

        this.timeouts.push(setTimeout(() => {
            loadFilteredPlaybackSources(playbackSources.filter((playbackSource) => !playbackSource.proxied));
        }, timeToWait));
    }
}
