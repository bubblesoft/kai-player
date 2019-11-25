/**
 * Created by qhyang on 2017/12/7.
 */

import IQueue from "../IQueue";

import Queue from "../Queue";
import Track from "../Track";

export default class extends Queue<Track> implements IQueue<Track> {
    private nextIndex: number|null;

    constructor({ name, mode, activeIndex }: { name?: string, mode?: string, activeIndex?: number } = {}) {
        super({ name, mode });

        this.activeIndex = activeIndex || null;
        this.nextIndex = this.getNextIndex();
    }

    public add(tracks: Track|Track[]) {
        // if (tracks instanceof Array) {
        //     tracks.forEach((track) => track.loadPlaybackSources());
        // } else {
        //     tracks.loadPlaybackSources();
        // }

        return super.add(tracks);
    }

    public insert(index: number, tracks: Track|Track[]) {
        // if (tracks instanceof Array) {
        //     tracks.forEach((item) => item.loadPlaybackSources());
        // } else {
        //     tracks.loadPlaybackSources();
        // }

        return super.insert(index, tracks);
    }

    public next() {
        if (typeof this.nextIndex !== "number") {
            this.nextIndex = this.getNextIndex();
        }

        this.activeIndex = this.nextIndex;
        this.nextIndex = this.getNextIndex();

        return this.activeIndex;
    }

    public getNext(): Track|null {
        if (typeof this.nextIndex !== "number") {
            this.nextIndex = this.getNextIndex();
        }

        if (typeof this.nextIndex !== "number") {
            return this.activeIndex ? this.get(this.activeIndex) : null;
        }

        return this.get(this.nextIndex);
    }
}
