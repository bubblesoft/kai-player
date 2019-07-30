export default interface IRenderer {
    init(mountPoint: HTMLElement): this;
    renderAudio(): this;
    renderAudio(bands: ((data: number[]) => void)[]): this;
    renderAudio(bands: ((data: number[]) => void)[], delta: number): this;
    renderPicture(): this;
    show(): this;
    hide(): this;
    start(): this;
    pause(): this;
    animate(): this;
    stopAnimate(): this;
    event(): Promise<void>;
}
