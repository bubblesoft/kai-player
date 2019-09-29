/**
 * Created by qhyang on 2017/12/11.
 */

import ITrack from "./ITrack";

import Artist from "./Artist";
import Message from "./Message";
import Source from "./source/Source";
import Status from "./Status";

interface IOptions {
    artists: Artist[];
    status?: Status;
    streamUrls?: string[];
    picture?: string;
    duration?: number;
    messages?: Message[];
    getStreamUrls?: (track: Track) => Promise<string[]>;
}

export default class Track implements ITrack {
    public readonly id: string;
    public readonly name: string;
    public readonly artists: Artist[];
    public readonly source: Source;
    public readonly messages: Set<Message> = new Set();
    public readonly picture?: string;
    public status: Status;
    public duration?: number;
    public streamUrls?: string[];
    private readonly getStreamUrls?: () => Promise<string[]>;

    constructor(id: string, name: string, source: Source, {
        artists,
        picture,
        status,
        streamUrls,
        duration,
        messages,
        getStreamUrls,
    }: IOptions) {
        this.id = id;
        this.name = name;
        this.artists = artists;
        this.source = source;
        this.picture = picture;
        this.status = status || Status.Ok;

        if (streamUrls && streamUrls.length) {
            this.streamUrls = streamUrls;
        }

        this.duration = duration;

        if (messages) {
            for (const message of messages) {
                this.messages.add(message);
            }
        }

        if (getStreamUrls) {
            this.getStreamUrls = async () => await getStreamUrls(this);
        }
    }

    public async loadStreamUrls() {
        if (this.getStreamUrls) {
            this.streamUrls = await this.getStreamUrls();

            return;
        }

        this.streamUrls = (await (await fetch("/audio/streamurls", {
            method: "POST",

            headers: new Headers({ "Content-Type": "application/json" }),

            body: JSON.stringify({
                id: this.id,
                source: this.source.id,
            }),
        })).json()).data;
    }
}
