import PlayerStatus from "./PlayerStatus";

export default interface IPlayer {
    readonly status: PlayerStatus;
    readonly duration: number;
    progress: number;
    volume: number;
    startRace(id?: number): number;
    joinRace(urls: string[]|string, id: number, timeToWait?: number): void;
    stopRace(): number;
    unload(): void;
    play(): void;
    pause(): void;
    stop(): void;
    on(event: string, callback: (...args: any) => void): void;
    once(event: string, callback: () => void): void;
    off(event: string, callback: () => void): void;
}
