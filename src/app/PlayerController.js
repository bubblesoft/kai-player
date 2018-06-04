/**
 * Created by qhyang on 2018/5/2.
 */

let playTrackPromiseReject = null;

export default class PlayerController {
    player;

    connect(player) {
        this.player = player;
    }

    playTrack(track) {
        return new Promise(async (resolve, reject) => {
            try {
                if (playTrackPromiseReject) {
                    playTrackPromiseReject({
                        message: 'Loading track interrupted'
                    });
                }

                playTrackPromiseReject = reject;

                const url = new URL(await track.getStreamUrl());

                try {
                    await this.player.load(`/${track.id.split('_')[0]}${url.pathname}${url.search}`);
                    resolve();
                    playTrackPromiseReject = null;
                } catch (e) {
                    await this.player.load(url.href);
                    resolve();
                    playTrackPromiseReject = null;
                }

                this.player.play();
            } catch (e) {
                reject(e);
            }
        });
    }
}