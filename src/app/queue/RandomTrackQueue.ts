/**
 * Created by qhyang on 2018/3/7.
 */

import config from "../../config";

import Track from "../Track";
import TrackQueue from "./TrackQueue";

export default class extends TrackQueue {
    public add(tracks: Track|Track[]) {
        super.add(tracks);

        if (this.length > config.queue.randomQueueThreshold) {
            this.items.shift();
        }

        return this.length - 1;
    }

    public next() {
        this.active = this.length - 1;

        return this.active;
    }
}
