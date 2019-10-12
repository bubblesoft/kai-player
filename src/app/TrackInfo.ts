import IMessage from "./IMessage";

import Message from "./Message";

export default class TrackInfo extends Message implements IMessage {
    public static SLOW_SOURCE = new TrackInfo(0, "The connection to the playback source is slow.");
    public static UNKNOWN = new TrackInfo(1, "Unknown information.");

    public static fromCode(code: number) {
        return TrackInfo.getMessageByCode(code, TrackInfo) || TrackInfo.UNKNOWN;
    }
}
