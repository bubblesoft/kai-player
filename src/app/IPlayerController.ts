import PlayTrackOptions from "./PlayTrackOptions";

import Track from "./Track";
import PlayerStatus from "./PlayerStatus";
import Player from "./Player";

export default interface IPlayer {
    player?: Player;
    readonly status: PlayerStatus;
    readonly duration: number;
    progress: number;
    volume: number;
    playTrack(track: Track, options?: PlayTrackOptions, callback?: () => void): Promise<void>;
    pause(): number;
    stop(): void;
}
