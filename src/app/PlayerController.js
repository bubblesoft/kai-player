/**
 * Created by qhyang on 2018/5/2.
 */

export default class PlayerController {
    player;
    playTrackPromiseReject = null;

    connect(player) {
        this.player = player;
    }

    playTrack(track) {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.playTrackPromiseReject) {
                    this.playTrackPromiseReject(new Error("Loading track interrupted"));
                }

                this.playTrackPromiseReject = reject;

                const url = new URL(track.streamUrl || ((await track.loadStreamUrl()) || track.streamUrl));

                try {
                    await this.player.load(`/${track.id.split('_')[0]}${url.pathname}${url.search}`);
                    this.playTrackPromiseReject = null;
                } catch (e) {
                    await this.player.load(url.href);
                    this.playTrackPromiseReject = null;
                }

                this.player.play();

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }
}