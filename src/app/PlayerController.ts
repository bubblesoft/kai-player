/**
 * Created by qhyang on 2018/5/2.
 */

import config from "../config";

import {fetchData, getSourceById} from "../scripts/utils";

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
    public player: Player|null = null;
    public visualizer: any|null;
    public background: any|null;
    public sources: Source[] = [];

    public get usingAltTrack() {
        return this.privateUsingAltTrack;
    }

    public timeToWait = config.defaultPreference.playback.timeToWait;

    private track?: Track;
    private privateUsingAltTrack = false;
    private loading = false;
    private resolveExistingLoadingPromise?: (() => void);
    private resolveExistingPlayTrackPromise?: (() => void);
    private altTracks: Track[] = [];
    private previousPlaying = false;
    private playbackId = 0;
    private timeouts: Array<ReturnType<typeof setTimeout>> = [];

    public playTrack(track: Track) {
        this.stopLoading();
        this.track = track;
        this.playbackId = new Date().getTime();

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
                this.loadTrack(track);
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

    private loadTrack(track: Track) {
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

        const altTracksPromise = fetchData("/audio/alttracks", {
            body: {
                artists: track.artists.map((artist) => artist.name),
                exceptedSources: [track.source.id],
                name: track.name,
            },
        });

        (async () => {
            try {
                const playbackSources = await (async () => {
                    if (track.playbackSources && track.playbackSources.length) {
                        return track.playbackSources;
                    }

                    await track.loadPlaybackSources();

                    return track.playbackSources;
                })();

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

        this.timeouts.push(setTimeout(async () => {
            if (track.status !== Status.Error) {
                track.status = Status.Warning;

                if (track.status !== Status.Warning) {
                    track.messages.clear();
                }

                track.messages.add(TrackInfo.SLOW_SOURCE);
            }

            try {
                this.altTracks = (await altTracksPromise)
                    .map(({ id, name, artists, source, picture, duration, playbackSources }: any) =>
                        new Track(id, name, getSourceById(source, this.sources), {
                            artists: artists.map((artist: any) => new Artist({ name: artist.name })),
                            duration,
                            picture,
                            playbackSources: playbackSources && playbackSources
                                .map(({ urls, quality }: PlaybackSource) => new PlaybackSource(urls, quality)),
                        }));

                if (aborted) {
                    return;
                }

                if (!this.altTracks || !this.altTracks.length) {
                    return;
                }

                this.altTracks.forEach(async (altTrack) => {
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
                        this.loadPlaybackSources(playbackSources);
                    }
                });
            } catch (e) {
                // console.log(e);
            }
        }, this.timeToWait));
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
        let aborted = false;

        const resolveExistingLoadingPromise = this.resolveExistingLoadingPromise;

        this.resolveExistingLoadingPromise = () => {
            if (resolveExistingLoadingPromise) {
                resolveExistingLoadingPromise();
            }

            resolvePlayback();
            aborted = true;
        };

        if (!this.player) {
            throw PlayerController.noPlayerError;
        }

        const onRacerFailCallback = (url: string) => {
            if (aborted) {
                if (!this.player) {
                    throw PlayerController.noPlayerError;
                }

                this.player.off("racerfail", onRacerFailCallback);

                return;
            }

            if (!this.track) {
                return;
            }

            const isOriginSource = this.track.playbackSources && this.track.playbackSources
                .map((playbackSource) => playbackSource.urls)
                .flat()
                .reduce((matched, playbackSourceUrl) => matched || playbackSourceUrl === url, false);

            if (isOriginSource) {
                this.track.status = Status.Error;
                this.track.messages.clear();
                this.track.messages.add(TrackError.SOURCE_NOT_VALID);
            }
        };

        this.player.on("racerfail", onRacerFailCallback);

        this.player.once("end", () => {
            rejectPlayback();
        });

        this.player.once("playerror", (soundId, err) => {
            rejectPlayback(err);

            if (this.resolveExistingLoadingPromise) {
                this.resolveExistingLoadingPromise();
            }
        });

        this.player.once("loaderror", (soundId, err) => {
            this.stopLoading();
            rejectPlayback(err);

            if (this.resolveExistingLoadingPromise) {
                this.resolveExistingLoadingPromise();
            }
        });

        this.player.once("load", (loadedUrl) => {
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

            // @ts-ignore
            this.visualizer.listen(this.player.sound._sounds[0]._node);
        });
    }

    private loadPlaybackSources(playbackSources: PlaybackSource[]) {
        this.timeouts.push(setTimeout(() => {
            playbackSources.forEach((playbackSource) => {
                const urls = playbackSource.urls.map((url) => `/proxy/${url}`);

                this.timeouts.push(setTimeout(() => {
                    if (!this.player) {
                        throw PlayerController.noPlayerError;
                    }

                    this.player.joinRace(urls, this.playbackId);
                }, Math.abs(this.expectedPlaybackQuality - playbackSource.quality) * this.timeToWait));
            });
        }, 0));

        this.timeouts.push(setTimeout(() => {
            playbackSources.forEach((playbackSource) => {
                this.timeouts.push(setTimeout(() => {
                    if (!this.player) {
                        throw PlayerController.noPlayerError;
                    }

                    this.player.joinRace(playbackSource.urls, this.playbackId);
                }, Math.abs(this.expectedPlaybackQuality - playbackSource.quality) * this.timeToWait));
            });
        }, this.timeToWait));
    }
}
