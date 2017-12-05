/**
 * Created by qhyang on 2017/12/5.
 */

import { Howl } from 'howler';

export default class Player {
    constructor() {
        this.sound = null;
    }

    load(urls) {
        this.sound = new Howl({
            src: urls,
            html5: true
        });
    }

    play() {
        if (this.sound) {
            this.sound.play();
        }
    }

    playing() {
        if (!this.sound) {
            return false;
        }

        return this.sound.playing();
    }
}