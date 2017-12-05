<template lang="pug">
    div.wrap
        div.play-button(@click="play()")
            svg(
                width="24"
                height="24"
                viewBox="0 0 24 24"
            )
                path(d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z")
</template>

<script>
    export default {
        methods: {
            play() {
                this.$store.state.playerModule.player.load([ require('../assets/46e1%2F6e85%2F8eba%2F2cadf8448f7aa4dba3fff1fd92e7b2fc.mp3') ]);
                this.$store.state.playerModule.player.play();
            }
        }
    }
</script>

<style lang="scss" scoped>
    .wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 15%;
        background-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 0 25px rgba(0, 0, 0, 0.1), inset 0 0 1px rgba(255, 255, 255, 0.6);

        .play-button {
            cursor: pointer;

            svg {
                width: 72px;
                height: 72px;
                fill: rgba(255, 255, 255, 0.6);
            }

            &:hover svg {
                fill: rgba(255, 255, 255, 0.9);
                 -webkit-filter: drop-shadow(2px 2px 10px rgba(150, 150, 150, 1));
                 filter: drop-shadow(2px 2px 10px rgba(150, 150, 150, 1));
                 -ms-filter: "progid:DXImageTransform.Microsoft.Dropshadow(OffX=2, OffY=2, Color='rgba(150, 150, 150, 1)')";
                 filter: "progid:DXImageTransform.Microsoft.Dropshadow(OffX=2, OffY=2, Color='rgba(150, 150, 150, 1)')";
            }
        }
    }
</style>