import IArtist from "./IArtist";

import Status from "./Status";
import Message from "./Message";
import Source from "./source/Source";

export default interface Track {
    readonly id: string;
    readonly name: string;
    readonly artists: IArtist[];
    readonly source: Source;
    readonly messages: Set<Message>;
    readonly streamUrl?: string;
    readonly picture?: string;
    status: Status;
    duration?: number;
    loadStreamUrls(): Promise<void>;
}
