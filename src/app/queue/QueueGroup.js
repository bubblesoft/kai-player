/**
 * Created by qhyang on 2017/12/7.
 */

import Set from '../Set';

export default class extends Set {
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

    goTo(index) {
        return this.active = index;
    }
};
