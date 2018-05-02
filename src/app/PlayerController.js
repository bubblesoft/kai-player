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
            await this.player.load(url.href);
        } catch (e) {
            try {
                await this.player.load(`${url.protocol}//${this.id.split('_')[0]}/${url.hostname}/${url.pathname}`);
            } catch(e) {

            }
        }

        this.player.play();
    }
}