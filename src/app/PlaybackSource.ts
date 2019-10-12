import IPlabackSource from "./IPlaybackSource";

export default class PlaybackSource implements IPlabackSource {
    public readonly urls: string[];
    public readonly quality: number;

    constructor(urls: string[]|string, quality: number) {
        if (Array.isArray(urls)) {
            this.urls = urls;
        } else {
            this.urls = [urls];
        }

        this.quality = quality;
    }
}
