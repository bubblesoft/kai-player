import IArtist from "./IArtist";

import Status from "./Status";

export default interface Track {
    readonly id: string;
    readonly name: string;
    readonly artists: IArtist[];
    readonly picture: string;
    duration: number|null;
    streamUrl: string|null;
    status: Status;
    loadStreamUrl(): Promise<void>;
}
