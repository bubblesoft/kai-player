/**
 * Created by qhyang on 2017/12/11.
 */

import ITrack from "./ITrack";

import Artist from "./Artist";
import Message from "./Message";
import PlaybackSource from "./PlaybackSource";
import Source from "./source/Source";
import Status from "./Status";

interface IOptions {
    artists: Artist[];
    status?: Status;
    playbackSources?: PlaybackSource[];
    picture?: string;
    duration?: number;
    messages?: Message[];
    getPlaybackSources?: (track: Track) => Promise<PlaybackSource[]>;
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
    public playbackSources?: PlaybackSource[];
    private readonly getPlaybackSources?: () => Promise<PlaybackSource[]>;

    constructor(id: string, name: string, source: Source, {
        artists,
        picture,
        status,
        playbackSources,
        duration,
        messages,
        getPlaybackSources,
    }: IOptions) {
        this.id = id;
        this.name = name;
        this.artists = artists;
        this.source = source;
        this.picture = picture;
        this.status = status || Status.Ok;

        if (playbackSources && playbackSources.length) {
            this.playbackSources = playbackSources;
        }

        this.duration = duration;

        if (messages) {
            for (const message of messages) {
                this.messages.add(message);
            }
        }

        if (getPlaybackSources) {
            this.getPlaybackSources = async () => await getPlaybackSources(this);
        }
    }

    public async loadPlaybackSources() {
        const playbackSources = await (async () => {
            if (this.getPlaybackSources) {
                return await this.getPlaybackSources();
            }

            return (await (await fetch("/audio/playbacksources", {
                method: "POST",

                headers: new Headers({ "Content-Type": "application/json" }),

                body: JSON.stringify({
                    id: this.id,
                    source: this.source.id,
                }),
            })).json()).data.map((data: any) => new PlaybackSource(data.urls, data.quality)) || this.playbackSources;
        })();

        if (playbackSources && playbackSources.length) {
            this.playbackSources = playbackSources;
        }

        if (this.playbackSources && !this.playbackSources.length) {
            delete this.playbackSources;
        }
    }
}
