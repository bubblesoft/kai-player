/**
 * Created by qhyang on 2018/5/2.
 */

import config from "../config";

import { fetchData, getSourceById } from "../scripts/utils";

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

    public playTrack(track: Track) {
        this.stopLoading();
        this.unwatchPlayer();
        this.track = track;
        this.playbackId = new Date().getTime();
        this.hasTrackAddedToPlayer = false;

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
                this.watchPlayer(resolvePlayback, rejectPlayback);
                this.altTracks = [];
                this.playbackId = new Date().getTime();
                this.loadTrack(track, resolvePlayback, rejectPlayback);
            } catch (e) {
                // console.log(e);

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

        const altTracksResPromises = (() => {
            return this.sources
                .filter((source) => source !== track.source)
                .map((source) => fetchData("/audio/alttracks", {
                    body: {
                        artists: track.artists.map((artist) => artist.name),
                        name: track.name,
                        similarityRange: {
                            high: preference.playback.alternativeTracks.similarityRange.high,
                            low: preference.playback.alternativeTracks.similarityRange.low,
                        },
                        sources: [source.id],
                    },
                }));
        })();

        const loadPlaybackSourcesPromise = (async () => {
            try {
                if (track.playbackSources && track.playbackSources.length) {
                    this.loadPlaybackSources(track.playbackSources);
                }

                const playbackSources = await track.loadPlaybackSources();

                if (aborted) {
                    return;
                }

                if (playbackSources && playbackSources.length) {
                    this.loadPlaybackSources(playbackSources);
                } else {
                    track.status = Status.Error;
                    track.messages.clear();
                    track.messages.add(TrackError.NO_AVAILABLE_SOURCE);
                }
            } catch (e) {
                // console.log(e);
            }
        })();

        const timeToWait = preference.playback.timeToWait;

        if (!preference.playback.alternativeTracks.enable) {
            return;
        }

        const loadAltTracksPromise = Promise.all(altTracksResPromises.map(async (altTracksResPromise) => {
            const res = await altTracksResPromise;

            if (res.code !== 1 || !res.data || res.data.length) {
                return;
            }

            const altTracks = res.data.map(({ id, name, artists, source, picture, duration, playbackSources }: any) =>
                new Track(id, name, getSourceById(source, this.sources), {
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
                                `/proxy/${url}`), playbackSource.quality, true))
                        .concat((() => playbackSources
                            .map((playbackSource: any): PlaybackSource|undefined => playbackSource.cached ?
                                undefined : new PlaybackSource(playbackSource.urls, playbackSource.quality, false))
                            .filter((playbackSource?: PlaybackSource) => playbackSource))()),
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
                    const playbackSources = await (async () => {
                        if (altTrack.playbackSources && altTrack.playbackSources.length) {
                            return altTrack.playbackSources;
                        }

                        await altTrack.loadPlaybackSources();

                        return altTrack.playbackSources;
                    })();

                    if (aborted) {
                        return;
                    }

                    if (playbackSources && playbackSources.length) {
                        track.addAltPlaybackSources(playbackSources.map((playbackSource) => ({
                            playbackSource,
                            similarity: similarities[i],
                        })));
                    }
                } catch (e) {
                    // console.log(e);
                }
            }));
        }));

        this.timeouts.push(setTimeout(async () => {
            if (track.status !== Status.Error) {
                track.status = Status.Warning;

                if (track.status !== Status.Warning) {
                    track.messages.clear();
                }

                track.messages.add(TrackInfo.SLOW_SOURCE);
            }

            if (track.altPlaybackSources.length) {
                track.altPlaybackSources.forEach(({ playbackSource, similarity }) =>
                    this.timeouts.push(setTimeout(() =>
                        this.loadPlaybackSources([playbackSource]), (1 - similarity) * timeToWait)));
            } else {
                await loadAltTracksPromise;

                if (aborted) {
                    return;
                }

                track.altPlaybackSources.forEach(({ playbackSource, similarity }) =>
                    this.timeouts.push(setTimeout(() =>
                        this.loadPlaybackSources([playbackSource]), (1 - similarity) * timeToWait)));
            }

            try {
                await loadAltTracksPromise;
            } catch (e) {
                // console.log(e);
            }

            if (aborted) {
                return;
            }

            try {
                await loadPlaybackSourcesPromise;
            } catch (e) {
                // console.log(e);
            }

            if (aborted) {
                return;
            }

            this.timeouts.push(setTimeout(async () => {
                if (!this.player) {
                    throw PlayerController.noPlayerError;
                }

                this.player.stopJoinRace();

                if (!this.hasTrackAddedToPlayer) {
                    rejectPlayback(new Error("No playback source available."));
                    this.stopLoading();

                    if (this.resolveExistingLoadingPromise) {
                        this.resolveExistingLoadingPromise();
                    }
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

        this.loading = false;
    }

    private watchPlayer(resolvePlayback: (value?: any) => void, rejectPlayback: (reason?: Error) => void) {
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

        this.onRacerFailCallback = (url: string) => {
            if (aborted) {
                if (!this.player) {
                    throw PlayerController.noPlayerError;
                }

                if (this.onRacerFailCallback) {
                    this.player.off("racerfail", this.onRacerFailCallback);
                }

                return;
            }

            if (!this.track || !this.track.playbackSources || !this.track.playbackSources.length) {
                return;
            }

            const isOriginSource = this.track.playbackSources
                .map((playbackSource) => playbackSource.urls)
                .flat()
                .reduce((matched, playbackSourceUrl) => matched || playbackSourceUrl === url, false);

            if (isOriginSource) {
                this.track.status = Status.Error;
                this.track.messages.clear();
                this.track.messages.add(TrackError.SOURCE_NOT_VALID);
                this.track.loadPlaybackSources();
            }

            for (const playbackSource of this.track.playbackSources) {
                if (playbackSource.urls.includes(url)) {
                    this.track.removePlaybackSource(playbackSource);
                }
            }

            for (const altPlaybackSource of this.track.altPlaybackSources) {
                if (altPlaybackSource.playbackSource.urls.includes(url)) {
                    this.track.removeAltPlaybackSource(altPlaybackSource);
                }
            }
        };

        this.player.on("racerfail", this.onRacerFailCallback);

        this.onEndCallback = () => {
            rejectPlayback();
        };

        this.player.once("end", this.onEndCallback);

        this.onPlayErrorCallback = (soundId, err) => {
            rejectPlayback(err);

            if (this.resolveExistingLoadingPromise) {
                this.resolveExistingLoadingPromise();
            }
        };

        this.player.once("playerror", this.onPlayErrorCallback);

        this.onLoadErrorCallback = (soundId, err) => {
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

            if (this.track) {
                const isOriginSource = this.track.playbackSources && this.track.playbackSources
                    .map((playbackSource) => playbackSource.urls)
                    .flat()
                    .map((url) => [url, `/proxy/${url}`])
                    .flat()
                    .reduce((matched, playbackSourceUrl) => matched || playbackSourceUrl === loadedUrl, false);

                if (isOriginSource) {
                    this.track.duration = this.player.duration * 1000;
                    this.track.status = Status.Ok;
                    this.track.messages.clear();
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

        // this.timeouts.push(setTimeout(() => {
        //     playbackSources.forEach((playbackSource) => {
        //         const urls = playbackSource.urls.map((url) => `/proxy/${url}`);
        //
        //         this.timeouts.push(setTimeout(() => {
        //             if (!this.player) {
        //                 throw PlayerController.noPlayerError;
        //             }
        //
        //             this.player.joinRace(urls, this.playbackId);
        //             this.hasTrackAddedToPlayer = true;
        //         }, Math.abs(this.expectedPlaybackQuality - playbackSource.quality) * timeToWait));
        //     });
        // }, 0));

        this.timeouts.push(setTimeout(() => {
            playbackSources.forEach((playbackSource) => {
                this.timeouts.push(setTimeout(() => {
                    if (!this.player) {
                        throw PlayerController.noPlayerError;
                    }

                    this.player.joinRace(playbackSource.urls, this.playbackId);
                    this.hasTrackAddedToPlayer = true;
                }, Math.abs(this.expectedPlaybackQuality - playbackSource.quality) * timeToWait));
            });
        }, timeToWait));
    }
}
