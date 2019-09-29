/**
 * Created by qhyang on 2017/12/5.
 */

import { Howl } from "howler";

import { initHowlOnProgress } from "../scripts/utils";

import IPlayer from "./IPlayer";

import PlayerStatus from "./PlayerStatus";

export default class Player implements IPlayer {
    public get status() {
        if (!this.sound) {
            return PlayerStatus.Unloaded;
        }

        if (this.sound.state() === "loaded") {
            if (this.streaming) {
                return PlayerStatus.Streaming;
            }

            if (this.sound.playing()) {
                return PlayerStatus.Playing;
            }

            if (this.seek) {
                return PlayerStatus.Paused;
            }

            return PlayerStatus.Loaded;
        }

        if (this.sound.state() === "loading") {
            return PlayerStatus.Loading;
        }

        if (this.sound.state() === "unloaded") {
            return PlayerStatus.Unloaded;
        }

        return PlayerStatus.Unloaded;
    }

    public get duration() {
        if (this.sound) {
            return this.sound.duration();
        } else {
            return 0;
        }
    }

    public get progress() {
        if (this.sound && this.sound.state() === "loaded") {
            const seek = this.sound.seek();

            if (typeof seek === "number") {
                this.seek = seek;

                return seek;
            } else {
                return this.seek;
            }
        } else {
            return 0;
        }
    }

    public set progress(progress) {
        if (this.sound) {
            this.sound.seek(progress);
        }

        this.seek = progress;
    }

    public get volume() {
        return this.privateVolume;
    }

    public set volume(volume) {
        if (this.sound) {
            this.sound.volume(volume);
        }
        this.privateVolume = volume;
    }

    private sound: Howl|undefined;
    private streaming = false;
    private privateVolume = 0;
    private seek: number;
    private onLoadCallbacks: Array<(...args: any) => void> = [];
    private onLoadErrorCallbacks: Array<(...args: any) => void> = [];
    private onPlayErrorCallbacks: Array<(...args: any) => void> = [];
    private onProgressCallbacks: Array<(...args: any) => void> = [];
    private onEndCallbacks: Array<(...args: any) => void> = [];
    private callbackWrapMap = new Map<(...args: any) => void, (...args: any) => void>();
    private abort: (() => void)|undefined;

    constructor() {
        this.volume = .5;
        this.seek = 0;
        this.callbackWrapMap.set(this.updateSeek, () => this.updateSeek());
    }

    public async load(urls: string[]|string) {
        if (this.abort) {
            this.abort();
        }

        let aborted = false;

        this.abort = () => {
            delete this.abort;
            aborted = true;
        };

        if (this.sound) {
            this.sound.unload();
            delete this.sound;
        }

        if (Array.isArray(urls)) {
            const winnerSound = await (async () => {
                const sounds = (urls as string[]).map((url) => new Howl({
                    format: ["mp3"],
                    html5: true,
                    src: url,
                    volume: this.volume,
                }));

                try {
                    let errCount = 0;

                    const winner = await Promise.race(sounds.map((sound) => new Promise<Howl>((resolve, reject) => {
                        sound.once("load", () => resolve(sound));

                        sound.once("loaderror", (id: number, err: number|Error) => {
                            errCount++;

                            if (errCount >= urls.length) {
                                reject([id, err]);
                            }
                        });
                    })));

                    if (!aborted) {
                        setTimeout(() => this.onLoadCallbacks.forEach((callback) => callback()), 0);
                    }

                    return winner;
                } catch ([id, err]) {
                    setTimeout(() => this.onLoadErrorCallbacks.forEach((callback) => callback(id, err)), 0);

                    return sounds[0];
                }
            })();

            if (aborted) {
                return;
            }

            this.sound = winnerSound;
        } else {
            this.sound = new Howl({
                format: ["mp3"],
                html5: true,
                src: urls,
                volume: this.volume,
            });

            this.onLoadCallbacks.forEach((callback) => {
                if (this.sound) {
                    this.sound.on("load", callback);
                }
            });

            this.onLoadErrorCallbacks.forEach((callback) => {
                if (this.sound) {
                    this.sound.on("loaderror", callback);
                }
            });
        }

        delete this.abort;
        initHowlOnProgress(this.sound);

        this.sound.on("progress", () => {
            this.streaming = false;
            this.updateSeek();
        });

        this.sound.on("stream", () => this.streaming = true);

        this.onPlayErrorCallbacks.forEach((callback) => {
            if (this.sound) {
                this.sound.on("playerror", callback);
            }
        });

        this.onProgressCallbacks.forEach((callback) => {
            if (this.sound) {
                this.sound.on("progress", callback);
            }
        });

        this.onEndCallbacks.forEach((callback) => {
            if (this.sound) {
                this.sound.on("end", callback);
            }
        });
    }

    public unload() {
        if (this.abort) {
            this.abort();
        }

        if (this.sound) {
            this.sound.unload();
            delete this.sound;
        }
    }

    public play() {
        if (this.sound) {
            this.sound.seek(this.seek);
            this.sound.play();
        }
    }

    public pause() {
        if (!this.sound) {
            return 0;
        }

        this.sound.pause();

        const seek = this.sound.seek();

        if (typeof seek === "number") {
            this.seek = seek;
        }

        return this.seek;
    }

    public stop() {
        if (this.abort) {
            this.abort();
        }

        this.streaming = false;

        if (this.sound) {
            if (this.sound.state() === "loading") {
                this.sound.unload();
            } else {
                this.sound.stop();
            }

            this.seek = 0;
        }
    }

    public on(event: string, callback: (...args: any) => any) {
        if (this.callbackWrapMap.has(callback)) {
            if (this.sound) {
                this.sound.off(event, this.callbackWrapMap.get(callback) || callback);
            }
        }

        if (this.sound) {
            this.sound.on(event, callback);
        }

        const callbackWrap = (id: number, err: number|string|Error) => {
            if (typeof err === "number") {
                callback(this.getLoadError(err));
            } else if (err instanceof Error) {
                callback(err);
            } else if (typeof err === "string") {
                callback(new Error(err));
            }

            callback(err);
        };

        switch (event) {
            case "load":
                if (this.sound) {
                    this.sound.on("load", callback);
                }

                this.onLoadCallbacks.push(callback);

                break;

            case "loaderror":
                if (this.sound) {
                    this.callbackWrapMap.set(callback, callbackWrap);
                    this.sound.on("loaderror", callbackWrap);
                }

                this.onLoadErrorCallbacks.push(callbackWrap);

                break;

            case "playerror":
                if (this.sound) {
                    this.callbackWrapMap.set(callback, callbackWrap);
                    this.sound.on("playerror", callbackWrap);
                }

                this.onPlayErrorCallbacks.push(callbackWrap);

                break;

            case "progress":
                if (this.sound) {
                    this.sound.on("progress", callback);
                }

                this.onProgressCallbacks.push(callback);

                break;

            case "end":
                if (this.sound) {
                    this.sound.on("end", callback);
                }

                this.onEndCallbacks.push(callback);

                break;
        }
    }

    public once(event: string, callback: (...args: any) => any) {
        if (this.callbackWrapMap.has(callback)) {
            if (this.sound) {
                this.sound.off(event, this.callbackWrapMap.get(callback) || callback);
            }
        }

        const callbackWrap = () => {
          callback();

          this.off(event, callbackWrap);
        };

        this.callbackWrapMap.set(callback, callbackWrap);
        this.on(event, callbackWrap);
    }

    public off(event: string, callback: (...args: any) => any) {
        const callbackWrap = this.callbackWrapMap.get(callback);

        if (callbackWrap) {
            this.callbackWrapMap.delete(callback);
        }

        switch (event) {
            case "load":
                if (this.sound) {
                    this.sound.off("load", callbackWrap || callback);
                }

                this.onLoadCallbacks.forEach((onLoadCallback, index, callbacks) => {
                    if (callback === onLoadCallback) {
                        callbacks.splice(index, 1);
                    }
                });

                break;

            case "loaderror":
                if (this.sound) {
                    this.sound.off("loaderror", callbackWrap || callback);
                }

                this.onLoadErrorCallbacks.forEach((onLoadErrorCallback, index, callbacks) => {
                    if (callback === onLoadErrorCallback) {
                        callbacks.splice(index, 1);
                    }
                });

                break;

            case "playerror":
                if (this.sound) {
                    this.sound.off("playerror", callbackWrap || callback);
                }

                this.onPlayErrorCallbacks.forEach((onPlayErrorCallback, index, callbacks) => {
                    if (callback === onPlayErrorCallback) {
                        callbacks.splice(index, 1);
                    }
                });

                break;

            case "progress":
                this.onProgressCallbacks.forEach((onProgressCallback, index, callbacks) => {
                    if (callback === onProgressCallback) {
                        callbacks.splice(index, 1);
                    }
                });

                break;

            case "end":
                if (this.sound) {
                    this.sound.off("end", callbackWrap || callback);
                }

                this.onEndCallbacks.forEach((onEndCallback, index, callbacks) => {
                    if (callback === onEndCallback) {
                        callbacks.splice(index, 1);
                    }
                });

                break;
        }
    }

    private updateSeek() {
        if (!this.sound) {
            return;
        }

        const seek = this.sound.seek();

        if (typeof seek === "number") {
            this.seek = seek;
        }
    }

    private getLoadError(errorCode: number) {
        // @ts-ignore
        for (const sound of this.sound._sounds) {
            if (sound._node && sound._node.error && sound._node.error.code === errorCode) {
                return sound._node.error;
            }
        }

        // @ts-ignore
        for (const sound of this.sound._sounds) {
            // @ts-ignore
            if (sound._node && sound._node.error) {
                // @ts-ignore
                return sound._node.error;
            }
        }

        const errorMessages = [
            "MEDIA_ELEMENT_ERROR: Aborted",
            "MEDIA_ELEMENT_ERROR: Network error",
            "MEDIA_ELEMENT_ERROR: Decode error",
            "MEDIA_ELEMENT_ERROR: Format error",
        ];

        return new Error(typeof errorCode === "number" ? errorMessages[errorCode - 1] : errorCode);
    }
}
