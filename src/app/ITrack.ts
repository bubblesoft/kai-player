import IArtist from "./IArtist";

import Status from "./Status";
import Message from "./Message";

export default interface Track {
    readonly id: string;
    readonly name: string;
    readonly artists: IArtist[];
    readonly picture: string;
    readonly streamUrl?: string;
    status: Status;
    duration?: number;
    messages?: Set<Message>;
    loadStreamUrl(): Promise<void>;
}
