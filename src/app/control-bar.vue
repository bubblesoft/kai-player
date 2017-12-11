<template lang="pug">
    div#control-bar
        div.control-button.control-button_big(
            v-if="!player.playing"
            @click="play()"
        )
            svg(
                width="24"
                height="24"
                viewBox="0 0 24 24"
            )
                path(d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z")
        div.control-button.control-button_big(
            v-else
            @click="pause()"
        )
            svg(
                width="24"
                height="24"
                viewBox="0 0 24 24"
            )
                path(d="M9 16h2V8H9v8zm3-14C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-4h2V8h-2v8z")
        div.control-button.control-button_small(@click="stop()")
            svg(
                width="24"
                height="24"
                viewBox="0 0 24 24"
            )
                path(d="M6 6h12v12H6z")
        vue-slider.vue-slider(
            @callback="changeProgress($event)"
            ref="slider"
            v-model="progress"
            width="30%"
            :max="duration()"
            :disabled="!ready()"
            tooltip="hover"
            :formatter="(v) => `${formatDuration(v * 1000, 'mm:ss')}`"
            :bg-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)' }"
            :slider-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)' }"
            :process-style="{ 'background-color': 'rgba(255, 255, 255, 0.9)', filter: 'drop-shadow(2px 2px 10px rgba(150, 150, 150, 1))' }"
            :tooltip-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)', 'border-color': 'rgba(255, 255, 255, 0.6)', 'border-style': 'none' }"
        )
        div.time {{ formatDuration(progress * 1000, 'mm:ss') }} / {{ formatDuration(duration() * 1000, 'mm:ss') }}
        vue-slider.vue-slider(
            ref="slider"
            v-model="volume"
            width="10%"
            :max="1"
            :interval=".01"
            tooltip="hover"
            :value=".5"
            :formatter="(v) => `${(v * 100).toFixed(0)}`"
            :bg-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)' }"
            :slider-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)' }"
            :process-style="{ 'background-color': 'rgba(255, 255, 255, 0.9)', filter: 'drop-shadow(2px 2px 10px rgba(150, 150, 150, 1))' }"
            :tooltip-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)', 'border-color': 'rgba(255, 255, 255, 0.6)', 'border-style': 'none' }"
        )
</template>

<script>
    import { mapState } from 'vuex';

    import vueSlider from 'vue-slider-component';

    import { formatDuration } from '../scripts/utils';

    export default {
        data: () => {
            return {
                progress: 0,
                volume: .5
            }
        },
        computed: mapState({
            player: state => state.playerModule.player
        }),
        watch: {
            "volume" (to) {
                this.player.volume = to;
            }
        },
        components: {
            vueSlider
        },
        methods: {
            formatDuration,
            ready() {
                return this.player.ready;
            },
            play() {
                this.player.play();
            },
            duration() {
                return this.player.duration;
            },
            pause() {
                this.player.pause();
            },
            stop() {
                this.player.stop();
                this.progress = 0;
            },
            changeProgress(progress) {
                this.player.progress = progress;
            }
        },
        created: function () {
            this.player.on('progress', (soundId, progress) => {
                this.progress = progress;
            });
            this.player.load([ require('../assets/46e1%2F6e85%2F8eba%2F2cadf8448f7aa4dba3fff1fd92e7b2fc.mp3') ]);
        },
        destroyed: function () {
            this.player.off('progress');
        }
    }
</script>

<style lang="scss" scoped>
    #control-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        left: 0;
        bottom: 0;
        box-sizing: border-box;
        width: 100%;
        height: 15vh;
        padding: 5px;
        background-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 0 25px rgba(0, 0, 0, 0.1), inset 0 0 1px rgba(255, 255, 255, 0.6);

        .control-button {
            margin: 8px;
            cursor: pointer;
        
            @media (max-width: 425px) {
                margin: 2px;
            }

            svg {
                width: 8vh;
                height: 8vh;
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

        .control-button_big {
            margin: 10px;

            @media (max-width: 425px) {
                margin: 3px;
            }

            svg {
                width: 10vh;
                height: 10vh;
            }
        }

        .control-button_small {
            margin: 6px;

            @media (max-width: 425px) {
                margin: 2px;
            }

            svg {
                width: 6vh;
                height: 6vh;
            }
        }

        .vue-slider {
            margin: 10px;

            @media (max-width: 425px) {
                margin: 3px;
            }
        }

        .time {
            color: #fff;
            font-size: 14px;
            text-align: center;
            white-space: nowrap;

            @media (max-width: 320px) {
                display: none;
            }
        }
    }
</style>