import IMessage from "./IMessage";

import Message from "./Message";

export default class TrackInfo extends Message implements IMessage {
    public static SLOW_CONNECTION = new TrackInfo(0, "The connection to the server is slow.");
    public static USTABLE_CONNECTION = new TrackInfo(1, "The connection to the server is unstable.");
    public static UNKNOWN = new TrackInfo(2, "Unknown information.");

    public static fromCode(code: number) {
        return TrackInfo.getMessageByCode(code, TrackInfo) || TrackInfo.UNKNOWN;
    }
}
