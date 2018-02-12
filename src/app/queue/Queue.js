/**
 * Created by qhyang on 2017/12/7.
 */

import Set from '../Set';

export default class Queue extends Set {
    mode;

    constructor({ name }) {
        super({ name });
        this.mode = 'repeat-all';
        this._active = null;
    }

    insert(index, ...items) {
        this._items.splice(index, 0 , ...items);

        if (this._items.length === 1) {
            this.active = index;
        }

        return index;
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
