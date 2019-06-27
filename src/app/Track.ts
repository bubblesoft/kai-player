/**
 * Created by qhyang on 2017/12/11.
 */

import ITrack from "./ITrack";

import Artist from "./Artist";

interface IOptions {
    id: string;
    name: string;
    streamUrl?: string;
    duration: number|null;
    artists: Artist[];
    picture: string;
    getStreamUrl?: (track: Track) => Promise<string>;
}

export default class Track implements ITrack {
    public duration: number|null;
    public streamUrl: string|null;
    private pId: string;
    private pName: string;
    private pArtists: Artist[];
    private pPicture: string;
    private getStreamUrl: (() => Promise<string>)|null = null;

    get id() {
        return this.pId;
    }

    get name() {
        return this.pName;
    }

    get artists() {
        return this.pArtists;
    }

    get picture() {
        return this.pPicture;
    }

    constructor({ id, name, streamUrl, duration, artists, picture, getStreamUrl }: IOptions) {
        this.streamUrl = null;
        this.pId = id;
        this.pName = name;

        if (streamUrl) {
            this.streamUrl = streamUrl;
        }

        this.duration = duration;
        this.pArtists = artists;
        this.pPicture = picture;

        if (getStreamUrl) {
            this.getStreamUrl = async () => await getStreamUrl(this);
        }
    }

    public async loadStreamUrl() {
        if (typeof this.getStreamUrl === "function") {
            this.streamUrl = await this.getStreamUrl();

            return;
        }

        this.streamUrl = (await (await fetch("/audio/streamurl", {
            method: "POST",

            headers: new Headers({ "Content-Type": "application/json" }),

            body: JSON.stringify({
                id: this.id.split("_")[1],
                source: this.id.split("_")[0],
            }),
        })).json()).data;
    }
}
