/**
 * Created by qhyang on 2018/3/7.
 */

import config from '../../config';

import Queue from './Queue';

export default class RandomQueue extends Queue {
    add(item) {
        super.add(item);

        if (this.length > config.queue.randQueueThreshold) {
            this._items.shift();
        }

        return this.length - 1;
    }

    next() {
        this.active = this.length - 1;

        return this.active;
    }
};
