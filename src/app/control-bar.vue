<template lang="pug">
    div#control-bar
        .tool-bar
            .track-name(v-if="track")
                yoyoMarquee(:title="track.name + '-' + (track.artists && track.artists.map(artist => artist.name).join(', '))")
                    span(style="color: #fff;") {{ track.name }} - {{ track.artists && track.artists.map(artist => artist.name).join(', ') || $t('Unknown Artist') }}
            .btn-group.btn-group-xs
                checkbox(
                    v-model="sourceOpen"
                    :button="true"
                )
                    svg(
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                    )
                        path(d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z")
                checkbox(
                    v-model="listOpen"
                    :button="true"
                )
                    svg(
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                    )
                        path(d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z")
                checkbox(
                    v-model="searchOpen"
                    :button="true"
                )
                    svg(
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                    )
                        path(d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z")
                checkbox(
                    v-model="playlistOpen"
                    :button="true"
                )
                    svg(
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                    )
                        path(d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z")
                checkbox(
                    v-model="tracksOpen"
                    :button="true"
                )
                    svg(
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                    )
                        path(d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z")
        .audio-control
            div.control-button.control-button_small(@click="previous()")
                svg(
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                )
                    path(d="M6 6h2v12H6zm3.5 6l8.5 6V6z")
            div.control-button.control-button_big(
                v-if="!playing"
                @click="play(queue.get(queue.active))"
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
            div.control-button.control-button_small(@click="next()")
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
            vue-slider.progress.vue-slider(
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
            vue-slider.volume.vue-slider(
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
    import { mapState, mapMutations } from 'vuex';

    import RandomQueue from './queue/RandomQueue';

    import { ADD_TRACK, UPDATE_PANEL } from '../scripts/mutation-types';

    import vueSlider from 'vue-slider-component';
    import checkbox from 'vue-strap/src/checkbox';

    import yoyoMarquee from './yoyo-marquee';

    import { getRecommendedTrack, formatDuration } from '../scripts/utils';

    export default {
        components: {
            vueSlider,
            checkbox,
            yoyoMarquee
        },

        data: () => {
            return {
                progress: 0,
                volume: .5
            }
        },

        computed: {
            track() {
                return this.queue.get(this.queue.active);
            },

            playing() {
                return this.player.playing
            },

            duration() {
                return this.player.duration;
            },

            sourceOpen: {
                get() {
                    return this.$store.state.generalModule.panels.source.open;
                },

                set(open) {
                    this[UPDATE_PANEL]({
                        index: 'source',
                        open
                    });
                }
            },

            listOpen: {
                get() {
                    return this.$store.state.generalModule.panels.list.open;
                },

                set(open) {
                    this[UPDATE_PANEL]({
                        index: 'list',
                        open
                    });
                }
            },

            searchOpen: {
                get() {
                    return this.$store.state.generalModule.panels.search.open;
                },

                set(open) {
                    this[UPDATE_PANEL]({
                        index: 'search',
                        open
                    });
                }
            },

            playlistOpen: {
                get() {
                    return this.$store.state.generalModule.panels.playlist.open;
                },

                set(open) {
                    this[UPDATE_PANEL]({
                        index: 'playlist',
                        open
                    });
                }
            },

            tracksOpen: {
                get() {
                    return this.$store.state.generalModule.panels.tracks.open;
                },

                set(open) {
                    this[UPDATE_PANEL]({
                        index: 'tracks',
                        open
                    });
                }
            },

            sources() {
                return this.sourceGroup.get()
            },

            ...mapState({
                queue: state => state.queueModule.queueGroup.get(state.queueModule.playingQueueIndex),
                player: state => state.playerModule.player,
                sourceGroup: state => state.sourceModule.sourceGroup,
                visualizer: state => state.visualizationModule.visualizer
            })
        },

        watch: {
            volume() {
                this.player.volume = to;
            }
        },

        methods: {
            formatDuration,

            ready() {
                return this.player.ready;
            },

            async play(track) {
                const url = await track.getStreamUrl();

                await this.player.load(url);
                this.player.play();
                this.visualizer.listen(this.player._sound._sounds[0]._node);
                this.visualizer.start();
            },

            pause() {
                this.player.pause();
                this.visualizer.stop();
            },

            stop() {
                this.player.stop();
                this.progress = 0;
                this.visualizer.stop();
            },

            changeProgress(progress) {
                this.player.progress = progress;
            },

            async previous() {
                this.play(this.queue.get(this.queue.previous()));
            },

            async next() {
                this.player.stop();

                if (this.queue.constructor === RandomQueue) {
                    this[ADD_TRACK](await getRecommendedTrack(this.queue.get(this.queue.active), this.sources));
                }

                this.play(this.queue.get(this.queue.next()));
            },

            ...mapMutations([
                ADD_TRACK,
                UPDATE_PANEL
            ])
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
        position: absolute;
        left: 0;
        bottom: 0;
        box-sizing: border-box;
        width: 100%;
        height: 12vh;
        padding: 4px;
        background-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 0 25px rgba(0, 0, 0, 0.1), inset 0 0 1px rgba(255, 255, 255, 0.6);
        z-index: 1;

        .tool-bar {
            display: flex;
            align-items: center;
            justify-content: space-around;

            .track-name {
                width: 50%;
            }

            svg {
                fill: #666;
                vertical-align: middle;
            }
        }

        .audio-control {
            display: flex;
            align-items: center;
            justify-content: center;

            .control-button {
                margin: 5px;
                line-height: 0;
                cursor: pointer;

                @media (max-width: 425px) {
                    margin: 1px;
                }

                svg {
                    width: 5vh;
                    height: 5vh;
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
                margin: 6px;

                @media (max-width: 425px) {
                    margin: 2px;
                }

                svg {
                    width: 6vh;
                    height: 6vh;
                }
            }

            .control-button_small {
                margin: 4px;

                @media (max-width: 425px) {
                    margin: 1px;
                }

                svg {
                    width: 4vh;
                    height: 4vh;
                }
            }

            .vue-slider {
                margin: 6px;

                @media (max-width: 425px) {
                    margin: 2px;
                }
            }

            .progress {
                @media (max-width: 425px) {
                    width: 45%;
                }
            }

            .time {
                color: #fff;
                font-size: 8px;
                text-align: center;
                white-space: nowrap;

                @media (max-width: 350px) {
                    display: none;
                }
            }

            .volume {
                @media (max-width: 768px) {
                    width: 15% !important;
                }

                @media (max-width: 425px) {
                    display: none;
                }
            }
        }
    }
</style>