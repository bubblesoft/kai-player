/**
 * Created by qhyang on 2018/3/7.
 */

import config from "../../config";

import Track from "../Track";
import TrackQueue from "./TrackQueue";

export default class extends TrackQueue {
    public add(tracks: Track|Track[]) {
        if (tracks instanceof Array) {
            if (tracks.filter((track) => track === undefined).length) {
                throw new Error("No item passed.");
            }

            this.items.unshift(...tracks);
        } else {
            if (tracks === undefined) {
                throw new Error("No item passed.");
            }

            this.items.unshift(tracks);
        }

        if (this.items.length === 1) {
            this.activeIndex = 0;
        }

        if (this.length > config.queue.randomQueueThreshold) {
            this.items.pop();
        }

        return this.length - 1;
    }

    public previous() {
        if (this.activeIndex === null) {
            this.activeIndex = 1;

            return this.activeIndex;
        }

        this.activeIndex = Math.min(this.activeIndex + 1, this.length);

        return this.activeIndex;
    }

    protected getNextIndex(): number|null {
        if (this.activeIndex === null) {
            return 0;
        }

        return Math.max(this.activeIndex - 1, 0);
    }
}
