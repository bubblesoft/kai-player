/**
 * Created by qhyang on 2018/5/2.
 */

export default class PlayerController {
    player;

    connect(player) {
        this.player = player;
    }

    async playTrack(track) {
        const url = new URL(await track.getStreamUrl());

        try {
            await this.player.load(`/${track.id.split('_')[0]}${url.pathname}`);
        } catch (e) {
            await this.player.load(url.href);
        }

        this.player.play();
    }
}