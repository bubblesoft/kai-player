import IMessage from "./IMessage";

import Message from "./Message";

export default class TrackError extends Message implements IMessage {
    public static NO_AVAILABLE_SOURCE =
        new TrackError(0, "The audio source doesn't provide a playback URL for this track.");
    public static SOURCE_NOT_VALID =
        new TrackError(1, "The playback URL provided by the audio source is not valid/reachable.");
    public static FORMAT_NOT_SUPPORTED = new TrackError(2, "The audio format of the playback source is not supported.");
    public static UNKNOWN = new TrackError(3, "Unknown error.");

    public static fromCode(code: number) {
        return TrackError.getMessageByCode(code, TrackError) || TrackError.UNKNOWN;
    }
}
