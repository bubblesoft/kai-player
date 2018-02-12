<template lang="pug">
    div#control-bar
        div.control-button.control-button_small(@click="previousTrack()")
            svg(
                width="24"
                height="24"
                viewBox="0 0 24 24"
            )
                path(d="M6 6h2v12H6zm3.5 6l8.5 6V6z")
        div.control-button.control-button_big(
            v-if="!playing"
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
        div.control-button.control-button_small(@click="nextTrack()")
            svg(
                width="24"
                height="24"
                viewBox="0 0 24 24"
            )
                path(d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z")
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
            :max="duration"
            :disabled="!ready()"
            tooltip="hover"
            :formatter="(v) => `${formatDuration(v * 1000, 'mm:ss')}`"
            :bg-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)' }"
            :slider-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)' }"
            :process-style="{ 'background-color': 'rgba(255, 255, 255, 0.9)', filter: 'drop-shadow(2px 2px 10px rgba(150, 150, 150, 1))' }"
            :tooltip-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)', 'border-color': 'rgba(255, 255, 255, 0.6)', 'border-style': 'none' }"
        )
        div.time {{ formatDuration(progress * 1000, 'mm:ss') }} / {{ formatDuration(duration * 1000, 'mm:ss') }}
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
        computed: {
            playing() {
              return this.player.playing
            },
            duration() {
                return this.player.duration;
            },
            ...mapState({
                queue: state => state.queueModule.queueGroup.get(state.queueModule.playingQueueIndex),
                player: state => state.playerModule.player
            })
        },
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
            async play() {
                const url = await this.queue.get(this.queue.active).getStreamUrl();

                await this.player.load(url);
                this.player.play();
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
            },
            async previousTrack() {
                const nextIndex = this.queue.previous(),
                    url = await this.queue.get(nextIndex).getStreamUrl();

                await this.player.load([url]);
                this.player.play();
            },
            async nextTrack() {
                const nextIndex = this.queue.next(),
                    url = await this.queue.get(nextIndex).getStreamUrl();

                await this.player.load([url]);
                this.player.play();
            }
        },
        created() {
            this.player.on('progress', (soundId, progress) => {
                this.progress = progress;
            });
        },
        destroyed() {
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