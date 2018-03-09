/**
 * Created by qhyang on 2017/12/7.
 */

import Set from '../Set';

export default class Queue extends Set {
    mode;

    constructor({ name }) {
        super({ name });
        this.mode = 'repeat-all';
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
        if (this.active < this.length - 1) {
            this.active++;
        } else {
            this.active = 0;
        }

        return this.active;
    }

    goTo(index) {
        return this.active = index;
    }
};
