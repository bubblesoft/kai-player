/**
 * Created by qhyang on 2017/12/7.
 */

import Set from '../Set';

export default class Queue extends Set {
    mode;

    get active() {
        return this._active;
    }

    set active(index) {
        this._active = index;
    }

    constructor({ name }) {
        super({ name });
        this.mode = 'repeat-all';
        this._active = null;
    }

    add(item) {
        if (this._items.length === 0) {
            this._active = 0;
        }

        return super.add(item);
    }

    previous() {
        if (this._active > 0) {
            this._active--;
        } else {
            this._active = this.length - 1;
        }

        return this._active;
    }

    next() {
        if (this._active < this.length - 1) {
            this._active++;
        } else {
            this._active = 0;
        }

        return this._active;
    }

    goTo(index) {
        return this._active = index;
    }
}
