import IPlabackSource from "./IPlaybackSource";

export default class PlaybackSource implements IPlabackSource {
    public readonly urls: string[];
    public readonly quality: number;
    public readonly proxied: boolean;

    constructor(urls: string[]|string, quality: number, proxied: boolean) {
        if (Array.isArray(urls)) {
            this.urls = urls;
        } else {
            this.urls = [urls];
        }

        this.quality = quality;
        this.proxied = proxied;
    }
}
