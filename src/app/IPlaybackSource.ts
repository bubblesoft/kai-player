export default interface IPlaybackSource {
    readonly urls: string[]|string;
    readonly quality: number;
    readonly proxied: boolean;
    readonly generated: boolean;
    readonly statical: boolean;
}
