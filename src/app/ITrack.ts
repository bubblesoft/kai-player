import IArtist from "./IArtist";

export default interface Track {
    readonly id: string;
    readonly name: string;
    readonly artists: IArtist[];
    readonly picture: string;
    duration: number|null;
    streamUrl: string|null;
    loadStreamUrl(): Promise<void>;
}
