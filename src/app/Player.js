/**
 * Created by qhyang on 2017/12/5.
 */

import { Howl } from 'howler';

import { initHowlOnProgress } from '../scripts/utils';

export default class Player {
    _sound;
    _volume;
    _seek;
    _onProgressCallbacks;
    _onEndCallbacks;

    get volume() {
        return this._volume;
    }

    set volume(volume) {
        if (this._sound) {
            this._sound.volume(volume);
        }
        this._volume = volume;
    }

    get progress() {
        if (this._sound && this._sound.state() === 'loaded') {
            return this._sound.seek();
        } else {
            return 0;
        }
    }

    set progress(progress) {
        if (this._sound) {
            this._sound.seek(progress);
            this._seek = progress;
        }
    }
    get ready() {
        if (!this._sound) {
            return false;
        }

        return this._sound.state() === 'loaded';
    }

    get state() {
        if (!this._sound) {
            return 'unloaded';
        }

        return this._sound.state();
    }

    get playing() {
        if (!this._sound) {
            return false;
        }

        return this._sound.playing();
    }

    get duration() {
        if (this._sound) {
            return this._sound.duration();
        } else {
            return 0;
        }
    }

    constructor() {
        this._sound = null;
        this.volume = .5;
        this._seek = 0;
        this._onProgressCallbacks = [];
        this._onEndCallbacks = [];
    }

    load(urls) {
        return new Promise((resolve, reject) => {
            if (this._sound) {
                this._sound.unload();
            }

            this._sound = new Howl({
                src: urls,
                volume: this.volume,
                html5: true,
                format: ['mp3']
            });

            initHowlOnProgress(this._sound);

            this._onProgressCallbacks.forEach(_callback => {
                this._sound.on('progress', _callback);
            });

            this._onEndCallbacks.forEach(_callback => {
                this._sound.on('end', _callback);
            });

            this._sound.once('load', () => {
                resolve();
            });

            this._sound.once('loaderror', (id, err) => {
                reject(err);
            });
        });
    }

    unload() {
        if (this._sound) {
            this._sound.unload();
        }
    }

    play() {
        if (this._sound) {
            this._sound.seek(this._seek);
            this._sound.play();
        }
    }

    pause() {
        if (this._sound) {
            this._sound.pause();
            this._seek = this._sound.seek();
        }
    }

    stop() {
        if (this._sound) {
            this._sound.stop();
            this._seek = 0;
        }
    }

    on(event, callback) {
        if (this._sound) {
            this._sound.on(event, callback);
        }

        switch (event) {
            case 'progress':
                this._onProgressCallbacks.push(callback);
                break;

            case 'end':
                if (this._sound) {
                    this._sound.on('end', callback);
                }
                this._onEndCallbacks.push(callback);
                break;


        }
    }

    off(event, callback) {
        if (this._sound) {
            this._sound.off(event, callback);
        }

        switch (event) {
            case 'progress':
                this._onProgressCallbacks.forEach((_callback, index, _callbacks) => {
                    if (callback === _callback) {
                        _callbacks.splice(index, 1);
                    }
                });

                break;

            case 'end':
                if (this._sound) {
                    this._sound.off('end', callback);
                }

                this._onEndCallbacks.forEach((_callback, index, _callbacks) => {
                    if (callback === _callback) {
                        _callbacks.splice(index, 1);
                    }
                });

                break;
        }
    }
}