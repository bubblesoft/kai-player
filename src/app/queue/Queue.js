/**
 * Created by qhyang on 2017/12/7.
 */

import Set from './Set';

export default class Queue extends Set {
    next() {
        if (this._active < this._items.length) {
            this._active++;
        } else {
            this._active = 0;
        }

        return this._active;
    }
}
