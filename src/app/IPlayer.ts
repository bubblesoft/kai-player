import PlayerStatus from "./PlayerStatus";

export default interface IPlayer {
    readonly status: PlayerStatus;
    readonly duration: number;
    progress: number;
    volume: number;
    load(urls: string[]|string): void;
    unload(): void;
    play(): void;
    pause(): void;
    stop(): void;
    on(event: string, callback: (...args: any) => void): void;
    once(event: string, callback: () => void): void;
    off(event: string, callback: () => void): void;
}
