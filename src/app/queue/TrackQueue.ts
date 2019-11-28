/**
 * Created by qhyang on 2017/12/7.
 */

import IQueue from "../IQueue";

import Queue from "../Queue";
import Track from "../Track";

export default class extends Queue<Track> implements IQueue<Track> {
    protected nextIndex: number;

    constructor({ name, mode, activeIndex }: { name?: string, mode?: string, activeIndex?: number } = {}) {
        super({ name, mode });

        this.activeIndex = activeIndex || -1;
        this.nextIndex = this.generateNextIndex();
    }

    public add(tracks: Track|Track[]) {
        // if (tracks instanceof Array) {
        //     tracks.forEach((track) => track.loadPlaybackSources());
        // } else {
        //     tracks.loadPlaybackSources();
        // }
        setTimeout(() => {
            this.nextIndex = this.generateNextIndex();
        }, 0);

        return super.add(tracks);
    }

    public insert(index: number, tracks: Track|Track[]) {
        // if (tracks instanceof Array) {
        //     tracks.forEach((item) => item.loadPlaybackSources());
        // } else {
        //     tracks.loadPlaybackSources();
        // }
        setTimeout(() => {
            this.nextIndex = this.generateNextIndex();
        }, 0);

        return super.insert(index, tracks);
    }

    public goTo(index: number) {
        setTimeout(() => {
            this.nextIndex = this.generateNextIndex();
        }, 0);

        return super.goTo(index);
    }

    public previous() {
        setTimeout(() => {
            this.nextIndex = this.generateNextIndex();
        }, 0);

        return super.previous();
    }

    public next() {
        if (typeof this.nextIndex !== "number") {
            this.nextIndex = this.generateNextIndex();
        }

        this.activeIndex = this.nextIndex;
        this.nextIndex = this.generateNextIndex();

        return this.activeIndex;
    }

    public switchMode() {
        setTimeout(() => {
            this.nextIndex = this.generateNextIndex();
        }, 0);

        return super.switchMode();
    }

    public getNext(): Track|null {
        if (this.nextIndex === -1) {
            this.nextIndex = this.generateNextIndex();
        }

        if (this.nextIndex === -1) {
            return null;
        }

        return this.get(this.nextIndex);
    }

    public getLastIndex(): number {
        return this.length - 1;
    }
}
