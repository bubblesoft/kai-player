/**
 * Created by qhyang on 2017/12/7.
 */

import QueueGroup from './QueueGroup';

const modes = ['repeat', 'repeatOne', 'shuffle'];

export default class extends QueueGroup {
    modeIndex;

    get mode() {
        return modes[this.modeIndex];
    }

    add(...items) {
        items.forEach((item) => item.loadStreamUrl());

        return super.add(...items);
    }

    insert(index, ...items) {
        items.forEach((item) => item.loadStreamUrl());

        super.insert(index, ...items);
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

    switchMode() {
        this.modeIndex++;

        if (this.modeIndex >= modes.length) {
            this.modeIndex = 0;
        }
    }
}
