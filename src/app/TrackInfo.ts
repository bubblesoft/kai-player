import IMessage from "./IMessage";

import Message from "./Message";

export default class TrackInfo extends Message implements IMessage {
    public static UNKNOWN = new TrackInfo(0, "Unknown information.");

    public static fromCode(code: number) {
        return TrackInfo.getMessageByCode(code, TrackInfo) || TrackInfo.UNKNOWN;
    }
}
