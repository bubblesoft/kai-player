import IArtist from "./IArtist";

import Status from "./Status";
import Message from "./Message";
import Source from "./source/Source";
import PlaybackSource from "./PlaybackSource";

interface IAltPlaybackSource {
    playbackSource: PlaybackSource;
    similarity: number;
}

interface IStreamUrlOptions {
    quality?: number;
    timeToWait?: number;
    sources?: Source[];
    similarityRange?: {
        high: number,
        low: number,
    };
}

export default interface Track {
    readonly id: string;
    readonly name: string;
    readonly artists: IArtist[];
    readonly source: Source|string;
    readonly messages: Set<Message>;
    readonly streamUrl?: string;
    readonly picture?: string;
    status: Status;
    duration?: number;
    preference?: any;
    sources: Source[];
    preload(): Promise<boolean>;
    loadPlaybackSources(): Promise<PlaybackSource[]>;
    removePlaybackSource(playbackSource: PlaybackSource): void;
    addAltPlaybackSources(altPlaybackSources: IAltPlaybackSource[]): void;
    removeAltPlaybackSource(altPlaybackSource: IAltPlaybackSource): void;
    generateStreamUrl(options?: IStreamUrlOptions): string;
    getAltTracks(): Promise<Track[]>;
}
