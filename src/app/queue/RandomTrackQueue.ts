/**
 * Created by qhyang on 2018/3/7.
 */

import config from "../../config";

import IQueue from "../IQueue";

import Track from "../Track";
import TrackQueue from "./TrackQueue";

export default class extends TrackQueue implements IQueue<Track> {
    public add(tracks: Track|Track[]) {
        if (Array.isArray(tracks)) {
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
        } else {
            this.activeIndex = Array.isArray(tracks) ? this.activeIndex + tracks.length : this.activeIndex + 1;
        }

        if (this.length > config.queue.randomQueueThreshold) {
            this.items.pop();
        }

        this.nextIndex = this.generateNextIndex();

        return Array.isArray(tracks) ? tracks.length - 1 : 0;
    }

    public previous() {
        if (this.activeIndex === null) {
            this.activeIndex = 1;

            return this.activeIndex;
        }

        this.activeIndex = Math.min(this.activeIndex + 1, this.length);
        this.nextIndex = this.generateNextIndex();

        return this.activeIndex;
    }

    public getLastIndex(): number {
        return 0;
    }

    protected generateNextIndex(): number {
        if (this.activeIndex === -1) {
            return -1;
        }

        return Math.max(this.activeIndex - 1, -1);
    }
}
