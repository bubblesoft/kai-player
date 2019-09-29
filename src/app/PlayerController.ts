/**
 * Created by qhyang on 2018/5/2.
 */

import {fetchData, getSourceById} from "../scripts/utils";

import IPlayerController from "./IPlayerController";

import Artist from "./Artist";
import Player from "./Player";
import PlayerStatus from "./PlayerStatus";
import Source from "./source/Source";
import Status from "./Status";
import Track from "./Track";
import TrackError from "./TrackError";

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

    public player: Player|null = null;
    public visualizer: any|null;
    public background: any|null;
    public sources: Source[] = [];

    public get usingAltTrack() {
        return this.privateUsingAltTrack;
    }

    private privateUsingAltTrack = false;
    private loading = false;
    private resolveExistingPlayTrackPromise: (() => void)|null = null;
    private altTracks: Track[] = [];
    private previousPlaying = false;

    public playTrack(track: Track) {
        let aborted = false;

        const playTrackPromise = new Promise<void>(async (resolvePlayback, rejectPlayback) => {
            if (this.resolveExistingPlayTrackPromise) {
                this.resolveExistingPlayTrackPromise();
            }

            this.resolveExistingPlayTrackPromise = () => {
                this.resolveExistingPlayTrackPromise = null;

                aborted = true;
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

                this.player.once("end", () => {
                    rejectPlayback();

                    if (this.resolveExistingPlayTrackPromise) {
                        this.resolveExistingPlayTrackPromise();
                    }
                });

                this.altTracks = [];

                const altTracksPromise = fetchData("/audio/alttracks", {
                    body: {
                        artists: track.artists.map((artist) => artist.name),
                        exceptedSources: [track.source.id],
                        name: track.name,
                    },
                });

                try {
                    await new Promise<void>(async (resolveOriginPlayback, rejectOriginPlayback) => {
                        const resolveExistingPlayTrackPromise = this.resolveExistingPlayTrackPromise;

                        this.resolveExistingPlayTrackPromise = () => {
                            if (resolveExistingPlayTrackPromise) {
                                resolveExistingPlayTrackPromise();
                            }

                            resolveOriginPlayback();
                        };

                        try {
                            if (!this.player) {
                                throw PlayerController.noPlayerError;
                            }

                            const streamUrls = await (async () => {
                                if (track.streamUrls) {
                                    return track.streamUrls;
                                }

                                await track.loadStreamUrls();

                                return track.streamUrls;
                            })();

                            if (aborted) {
                                return resolveOriginPlayback();
                            }

                            if (streamUrls && streamUrls.length) {
                                this.player.once("playerror", (soundId, err) => rejectOriginPlayback(err));
                                this.player.once("loaderror", (soundId, err) => rejectOriginPlayback(err));
                                this.player.once("end", resolveOriginPlayback);

                                await this.playUrls(streamUrls);

                                if (aborted) {
                                    return resolveOriginPlayback();
                                }

                                track.status = Status.Ok;
                                track.duration = this.player.duration * 1000;
                            } else {
                                track.status = Status.Error;
                                track.messages.clear();
                                track.messages.add(TrackError.NO_AVAILABLE_SOURCE);

                                throw new Error(TrackError.NO_AVAILABLE_SOURCE.text);
                            }

                            await playTrackPromise;

                            resolveOriginPlayback();
                        } catch (e) {
                            if (aborted) {
                                return resolveOriginPlayback();
                            }

                            rejectOriginPlayback(e);
                        }
                    });
                } catch (e) {
                    // console.log(e);

                    if (aborted) {
                        return this.resolveExistingPlayTrackPromise();
                    }

                    track.status = Status.Error;

                    if (!e || e.message !== TrackError.NO_AVAILABLE_SOURCE.text) {
                        track.messages.clear();
                        track.messages.add(TrackError.SOURCE_NOT_VALID);
                    }

                    this.altTracks = (await altTracksPromise)
                        .map(({ id, name, artists, source, picture, duration, streamUrls }: any) =>
                            new Track(id, name, getSourceById(source, this.sources), {
                                artists: artists.map((artist: any) => new Artist({ name: artist.name })),
                                duration,
                                picture,
                                streamUrls,

                            }));

                    if (aborted) {
                        return this.resolveExistingPlayTrackPromise();
                    }

                    if (!this.altTracks || !this.altTracks.length) {
                        rejectPlayback();
                        this.resolveExistingPlayTrackPromise();
                    }

                    let err: Error|null = null;

                    for (const altTrack of this.altTracks) {
                        const streamUrls = await (async () => {
                            if (altTrack.streamUrls) {
                                return altTrack.streamUrls;
                            }

                            await altTrack.loadStreamUrls();

                            return altTrack.streamUrls;
                        })();

                        if (aborted) {
                            if (this.resolveExistingPlayTrackPromise) {
                                this.resolveExistingPlayTrackPromise();
                            } else {
                                resolvePlayback();
                            }

                            return;
                        }

                        if (streamUrls && streamUrls.length) {
                            try {
                                await this.playUrls(streamUrls);

                                if (aborted) {
                                    if (this.resolveExistingPlayTrackPromise) {
                                        this.resolveExistingPlayTrackPromise();
                                    } else {
                                        resolvePlayback();
                                    }

                                    return;
                                }

                                this.privateUsingAltTrack = true;

                                break;
                            } catch (e) {
                                // console.log(e);

                                if (aborted) {
                                    if (this.resolveExistingPlayTrackPromise) {
                                        this.resolveExistingPlayTrackPromise();
                                    } else {
                                        resolvePlayback();
                                    }

                                    return;
                                }

                                err = e;
                            }
                        }
                    }

                    if (err) {
                        rejectPlayback(err);
                        this.resolveExistingPlayTrackPromise();
                    }

                    this.player.once("playerror", (soundId, playError) => {
                        rejectPlayback(playError);

                        if (this.resolveExistingPlayTrackPromise) {
                            this.resolveExistingPlayTrackPromise();
                        }
                    });
                    this.player.once("loaderror", (soundId, loadError) => {
                        rejectPlayback(loadError);

                        if (this.resolveExistingPlayTrackPromise) {
                            this.resolveExistingPlayTrackPromise();
                        }
                    });
                }
            } catch (e) {
                // console.log(e);

                rejectPlayback(e);
                this.resolveExistingPlayTrackPromise();
            }
        });

        return playTrackPromise;
    }

    public pause() {
        if (!this.player) {
            return 0;
        }

        this.player.pause();

        setTimeout(async () => {
            await this.background.event("pause");
            await this.background.event("reset");
        }, 0);

        return this.player.progress;
    }

    public stop() {
        this.loading = false;

        if (this.player) {
            this.player.stop();
        }

        setTimeout(async () => {
            await this.background.event("stop");
            await this.background.event("reset");
        }, 0);

        if (this.resolveExistingPlayTrackPromise) {
            this.resolveExistingPlayTrackPromise();
            this.resolveExistingPlayTrackPromise = null;
        }
    }

    private async playUrls(urls: string[]) {
        let aborted = false;

        const resolveExistingPlayTrackPromise = this.resolveExistingPlayTrackPromise;

        this.resolveExistingPlayTrackPromise = () => {
            if (resolveExistingPlayTrackPromise) {
                resolveExistingPlayTrackPromise();
            }

            aborted = true;
        };

        try {
            await new Promise((resolve, reject) => {
                if (!this.player) {
                    throw PlayerController.noPlayerError;
                }

                this.player.once("load", resolve);
                this.player.once("loaderror", reject);
                this.player.load(urls.map((url) => `/proxy/${url}`));
            });
        } catch (e) {
            // console.log(e);

            if (aborted) {
                return;
            }

            await new Promise((resolve, reject) => {
                if (!this.player) {
                    throw PlayerController.noPlayerError;
                }

                this.player.once("load", resolve);
                this.player.once("loaderror", reject);
                this.player.load(urls);
            });
        }

        if (aborted) {
            return;
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
    }
}
