/**
 * Created by qhyang on 2017/12/11.
 */

import ITrack from "./ITrack";

import Artist from "./Artist";
import Status from "./Status";

interface IOptions {
    id: string;
    name: string;
    streamUrl?: string;
    duration: number|null;
    artists: Artist[];
    picture: string;
    status: Status;
    getStreamUrl?: (track: Track) => Promise<string>;
}

export default class Track implements ITrack {
    public duration: number|null;
    public streamUrl: string|null;
    public status: Status;
    public readonly id: string;
    public readonly name: string;
    public readonly artists: Artist[];
    public readonly picture: string;
    private readonly getStreamUrl: (() => Promise<string>)|null = null;

    constructor({ id, name, streamUrl, duration, artists, picture, status, getStreamUrl }: IOptions) {
        this.streamUrl = null;
        this.id = id;
        this.name = name;

        if (streamUrl) {
            this.streamUrl = streamUrl;
        }

        this.duration = duration;
        this.artists = artists;
        this.picture = picture;
        this.status = status || Status.Ok;

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
