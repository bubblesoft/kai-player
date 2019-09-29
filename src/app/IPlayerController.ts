import Track from "./Track";
import PlayerStatus from "./PlayerStatus";
import Player from "./Player";

export default interface IPlayer {
    player: Player|null;
    readonly status: PlayerStatus;
    readonly duration: number;
    progress: number;
    volume: number;
    playTrack(track: Track): Promise<void>;
    pause(): number;
    stop(): void;
}
