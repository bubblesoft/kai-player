import IPlabackSource from "./IPlaybackSource";

interface IOptions {
    proxied?: boolean;
    generated?: boolean;
    statical?: boolean;
}

export default class PlaybackSource implements IPlabackSource {
    public readonly urls: string[];
    public readonly quality: number;
    public readonly proxied: boolean;
    public readonly generated: boolean;
    public readonly statical: boolean;

    constructor(urls: string[]|string, quality: number, {
        proxied = false,
        generated = false,
        statical = false }: IOptions = {}) {
        if (Array.isArray(urls)) {
            this.urls = urls;
        } else {
            this.urls = [urls];
        }

        this.quality = quality;
        this.proxied = proxied;
        this.generated = generated;
        this.statical = statical;
    }
}
