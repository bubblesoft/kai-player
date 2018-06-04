/**
 * Created by qhyang on 2017/12/7.
 */

import Set from '../Set';

const modes = ['repeat', 'repeatOne', 'shuffle'];

export default class Queue extends Set {
    modeIndex;

    get mode() {
        return modes[this.modeIndex];
    }

    constructor({ name }) {
        super({ name });
        this.modeIndex = 0;
    }

    insert(index, ...items) {
        this._items.splice(index, 0 , ...items);

        if (this.length === 1) {
            this.active = index;
        }

        return index;
    }

    previous() {
        if (this.active > 0) {
            this.active--;
        } else {
            this.active = this.length - 1;
        }

        return this.active;
    }

    next() {
        switch (this.mode) {
            case 'repeat':
            default:
                if (this.active < this.length - 1) {
                    this.active++;
                } else {
                    this.active = 0;
                }

                break;

            case 'repeatOne':
                break;

            case 'shuffle':
                this.active = Math.floor(Math.random() * this.length);

                break;

        }

        return this.active;
    }

    goTo(index) {
        return this.active = index;
    }

    switchMode() {
        this.modeIndex++;

        if (this.modeIndex >= modes.length) {
            this.modeIndex = 0;
        }
    }
};
