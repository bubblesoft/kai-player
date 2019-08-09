/**
 * Created by qhyang on 2017/12/11.
 */

import ITrack from "./ITrack";

import Artist from "./Artist";
import Message from "./Message";
import Status from "./Status";

interface IOptions {
    id: string;
    name: string;
    artists: Artist[];
    picture: string;
    status: Status;
    streamUrl?: string;
    duration?: number;
    messages?: Message[];
    getStreamUrl?: (track: Track) => Promise<string>;
}

export default class Track implements ITrack {
    public readonly id: string;
    public readonly name: string;
    public readonly artists: Artist[];
    public readonly picture: string;
    public status: Status;
    public duration?: number;
    public streamUrl?: string;
    public messages?: Set<Message>;
    private readonly getStreamUrl?: () => Promise<string>;

    constructor({ id, name, artists, picture, status, streamUrl, duration, messages, getStreamUrl }: IOptions) {
        this.id = id;
        this.name = name;
        this.artists = artists;
        this.picture = picture;
        this.status = status || Status.Ok;

        if (streamUrl) {
            this.streamUrl = streamUrl;
        }

        this.duration = duration;

        if (messages) {
            this.messages = new Set(messages);
        }

        if (getStreamUrl) {
            this.getStreamUrl = async () => await getStreamUrl(this);
        }
    }

    public async loadStreamUrl() {
        if (this.getStreamUrl) {
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
