/**
 * Created by qhyang on 2017/12/7.
 */

import IQueue from "../IQueue";

import Queue from "../Queue";
import Track from "../Track";

export default class extends Queue<Track> implements IQueue<Track> {
    public add(tracks: Track|Track[]) {
        if (tracks instanceof Array) {
            tracks.forEach((track) => track.loadPlaybackSources());
        } else {
            tracks.loadPlaybackSources();
        }

        return super.add(tracks);
    }

    public insert(index: number, tracks: Track|Track[]) {
        if (tracks instanceof Array) {
            tracks.forEach((item) => item.loadPlaybackSources());
        } else {
            tracks.loadPlaybackSources();
        }

        return super.insert(index, tracks);
    }
}
