<template lang="pug">
    #control-bar(:style="{ backgroundImage: 'url(' + require('../assets/highlight.svg') + '),linear-gradient(rgba(255,255,255,.15) 10%,rgba(255,255,255,0) 90%),url(' + pic + ')' }")
        .tool-bar
            .options
                select.form-control(
                    v-if="visualizationInit"
                    v-model="activeBackgroundType"
                )
                    option(
                        value=""
                        disabled
                    ) {{ $t('Select a background') }}
                    option(
                        v-for="tpe in background.types"
                        :value="tpe.value"
                    ) {{ $t(tpe.name) }}
                select.form-control(
                    v-if="visualizationInit"
                    v-model="activeVisualizerType"
                )
                    option(
                        value=""
                        disabled
                    ) {{ $t('Select a visualizer') }}
                    option(
                        v-for="type in visualizer.types"
                        :value="type.value"
                    ) {{ $t(type.name) }}
                .btn-group.btn-group-xs(v-if="layout")
                    checkbox(
                        v-model="pictureOpen"
                        :button="true"
                    )
                        svg(
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                        )
                            path(d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z")
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
                .control-button(
                    @click="toggleSettingsModal();"
                )
                    svg(
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                    )
                        path(d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.488.488 0 0 0 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z")
            .track-name
                yoyoMarquee(
                    v-if="track"
                    :title="track.name + '-' + (track.artists && track.artists.map(artist => artist.name).join(', '))"
                )
                    span(style="color: #fff;") {{ track.name }} - {{ track.artists && track.artists.map(artist => artist.name).join(', ') || $t('Unknown Artist') }}
        .audio-control
            .control-button.control-button_small(v-interact:tap="previous")
                svg(
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                )
                    path(d="M6 6h2v12H6zm3.5 6l8.5 6V6z")
            .control-button.control-button_big(
                v-if="!playing"
                v-interact:tap="async () => { play(); }"
                :class="{ loading: loading || player.state === 'loading' }"
                key="play"
            )
                svg(
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                )
                    path(d="M8 5v14l11-7z")
            .control-button.control-button_big(
                v-else
                v-interact:tap="pause"
                :class="{ loading: loading || player.state === 'loading' }"
                key="pause"
            )
                svg(
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                )
                    path(d="M6 19h4V5H6v14zm8-14v14h4V5h-4z")
            .control-button.control-button_small(v-interact:tap="next")
                svg(
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                )
                    path(d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z")
            .control-button.control-button_small(v-interact:tap="stop")
                svg(
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                )
                    path(d="M6 6h12v12H6z")
            vue-slider.progress(
                @callback="changeProgress($event)"
                v-model="progress"
                width="30%"
                :max="duration"
                :speed=".2"
                :disabled="!ready()"
                tooltip="hover"
                :formatter="(v) => `${formatDuration(v * 1000, 'mm:ss')}`"
                :bg-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)' }"
                :slider-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)' }"
                :process-style="{ 'background-color': 'rgba(255, 255, 255, 0.9)', filter: 'drop-shadow(2px 2px 10px rgba(150, 150, 150, 1))' }"
                :tooltip-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)', 'border-color': 'rgba(255, 255, 255, 0.6)', 'border-style': 'none' }"
            )
            .time {{ formatDuration(progress * 1000, 'mm:ss') }} / {{ formatDuration(duration * 1000, 'mm:ss') }}
            vue-slider.volume(
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
            tooltip.mode-switch(
                v-if="mode === 'shuffle'"
                effect="fadein"
                placement="top"
                :content="$t('Shuffle')"
            )
                .control-button(v-interact:tap="() => { SWITCH_QUEUE_MODE(); }")
                    svg(
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                    )
                        path(d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z")
            tooltip.mode-switch(
                v-else-if="mode === 'repeatOne'"
                effect="fadein"
                placement="top"
                :content="$t('Repeat one')"
            )
                .control-button(v-interact:tap="() => { SWITCH_QUEUE_MODE(); }")
                    svg(
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                    )
                        path(d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z")
            tooltip.mode-switch(
                v-else
                effect="fadein"
                placement="top"
                :content="$t('Repeat all')"
            )
                .control-button(v-interact:tap="() => { SWITCH_QUEUE_MODE(); }")
                    svg(
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                    )
                        path(d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z")
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';

    import scale from '../scripts/scale';
    import applyCanvasMask from '../scripts/canvasMask';

    import RandomQueue from './queue/RandomQueue';

    import { ADD_TRACK, SWITCH_QUEUE_MODE, UPDATE_ACTIVE_BACKGROUND_TYPE, UPDATE_ACTIVE_VISUALIZER_TYPE, SWITCH_TO_BACKGROUND, SWITCH_TO_VISUALIZER, TRIGGER_BACKGROUND_EVENT, VISUALIZER_LISTEN_TO, BACKGROUND_LOAD_RESOURCE, VISUALIZER_LOAD_RESOURCE } from '../scripts/mutation-types';

    import vueSlider from 'vue-slider-component';
    import checkbox from 'vue-strap/src/checkbox';
    import tooltip from 'vue-strap/src/tooltip';

    import yoyoMarquee from './yoyo-marquee';

    import { getRecommendedTrack, formatDuration, loadImage } from '../scripts/utils';

    export default {
        components: {
            vueSlider,
            checkbox,
            tooltip,
            yoyoMarquee
        },

        data: () => {
            return {
                progress: 0,
                volume: .5,
                pic: '',
                loading: false
            }
        },

        computed: {
            track() {
                return this.queue ? this.queue.get(this.queue.active) : [];
            },

            player() {
                return this.playerController.player;
            },

            playing() {
                return this.player.playing
            },

            duration() {
                return this.player.duration;
            },

            mode() {
                return this.queue.mode;
            },

            activeBackgroundType: {
                get() {
                    return this.background.activeType;
                },
                set(type) {
                    this[UPDATE_ACTIVE_BACKGROUND_TYPE](type);
                    this.track && this[BACKGROUND_LOAD_RESOURCE]({ picture: this.track.picture });
                }
            },

            activeVisualizerType: {
                get() {
                    return this.visualizer.activeType;
                },
                set(type) {
                    this[UPDATE_ACTIVE_VISUALIZER_TYPE](type);
                    this.track && this[BACKGROUND_LOAD_RESOURCE]({ picture: this.track.picture });
                }
            },

            pictureOpen: {
                get() {
                    return this.$store.state.generalModule.layout.picture.visible;
                },

                set(visible) {
                    const layout = this.layout.picture;

                    layout.visible = visible;

                    this.saveLayout({
                        index: 'picture',
                        layout
                    });
                }
            },

            sourceOpen: {
                get() {
                    return this.$store.state.generalModule.layout.source.visible;
                },

                set(visible) {
                    const layout = this.layout.source;

                    layout.visible = visible;

                    this.saveLayout({
                        index: 'source',
                        layout
                    });
                }
            },

            listOpen: {
                get() {
                    return this.$store.state.generalModule.layout.list.visible;
                },

                set(visible) {
                    const layout = this.layout.list;

                    layout.visible = visible;

                    this.saveLayout({
                        index: 'list',
                        layout
                    });
                }
            },

            searchOpen: {
                get() {
                    return this.$store.state.generalModule.layout.search.visible;
                },

                set(visible) {
                    const layout = this.layout.search;

                    layout.visible = visible;

                    this.saveLayout({
                        index: 'search',
                        layout
                    });
                }
            },

            playlistOpen: {
                get() {
                    return this.$store.state.generalModule.layout.playlist.visible;
                },

                set(visible) {
                    const layout = this.layout.playlist;

                    layout.visible = visible;

                    this.saveLayout({
                        index: 'playlist',
                        layout
                    });
                }
            },

            tracksOpen: {
                get() {
                    return this.$store.state.generalModule.layout.tracks.visible;
                },

                set(visible) {
                    const layout = this.layout.tracks;

                    layout.visible = visible;

                    this.saveLayout({
                        index: 'tracks',
                        layout
                    });
                }
            },

            sources() {
                return this.sourceGroup.get()
            },

            ...mapState({
                queue: state => state.queueModule.queueGroup.get(state.queueModule.playingQueueIndex),
                playerController: state => state.playerModule.playerController,
                sourceGroup: state => state.sourceModule.sourceGroup,
                visualizationInit: state => state.visualizationModule.init,
                background: state => state.visualizationModule.background,
                visualizer: state => state.visualizationModule.visualizer,
                layout: state => state.generalModule.layout
            })
        },

        watch: {
            volume(to) {
                this.player.volume = to;
            },

            async track(to) {
                if (to && to.picture) {
                    this.pic = applyCanvasMask(scale({ width: 200, height: 200 }, await loadImage(to.picture)), await loadImage(require('../assets/mask.png')), 200, 200, true);
                } else {
                    this.pic = '';
                }
            }
        },

        methods: {
            formatDuration,

            ready() {
                return this.player.ready;
            },

            async _playTrack(track) {
                if (track) {
                    await this.playerController.playTrack(track);

                    if (this.activeVisualizerType === 'random') {
                        this.activeVisualizerType = 'random';
                    }

                    this[VISUALIZER_LISTEN_TO]((this.player._sound._sounds[0]._node));
                    this[VISUALIZER_LOAD_RESOURCE]({ picture: track.picture });

                }
            },

            async play() {
                if (this.player.progress) {
                    this.player.play();
                } else {
                    this.loading = true;

                    try {
                        if (this.queue.active !== null) {
                            await this._playTrack(this.queue.get(this.queue.active));
                        } else {
                            await this._playTrack(await new Promise(resolve => {
                                const unwatch = this.$watch('track', (to) => {
                                    unwatch();
                                    resolve(to);
                                });
                            }));
                        }
                    } catch (e) { }

                    this.loading = false;
                }

                await this.triggerBackgroundEvent('play');
                this[SWITCH_TO_VISUALIZER]();
            },

            async pause() {
                this.player.pause();
                this.visualizer.stop();
                this[SWITCH_TO_BACKGROUND]();
                this[BACKGROUND_LOAD_RESOURCE]({ picture: this.track.picture });
                await this.triggerBackgroundEvent('pause');
                await this.triggerBackgroundEvent('reset');
            },

            async stop() {
                if (!this.player.playing) {
                    return;
                }

                this.player.stop();
                this.progress = 0;
                this.visualizer.stop();
                this[SWITCH_TO_BACKGROUND]();
                this[BACKGROUND_LOAD_RESOURCE]({ picture: this.track.picture });
                await this.triggerBackgroundEvent('stop');
                await this.triggerBackgroundEvent('reset');
            },

            changeProgress(progress) {
                this.player.progress = progress;
            },

            async previous() {
                const playing = this.player.playing;

                await this._playTrack(this.queue.get(this.queue.previous()));
                await this.triggerBackgroundEvent('previousTrack');

                if (!playing) {
                    this[SWITCH_TO_VISUALIZER]();
                }
            },

            async next() {
                const playing = this.player.playing;

                this.player.stop();

                if (this.queue.constructor === RandomQueue) {
                    this.loading = true;
                    this[ADD_TRACK]({ track: await getRecommendedTrack(this.track, this.sources.filter(source => source.active)) });
                    this.loading = false;
                }

                await this._playTrack(this.queue.get(this.queue.next()));
                await this.triggerBackgroundEvent('nextTrack');

                if (!playing) {
                    this[SWITCH_TO_VISUALIZER]();
                }
            },

            toggleSettingsModal() {
                setTimeout(() => { this.$emit('toggleSettingsModal'); }, 350);
            },

            ...mapMutations([
                ADD_TRACK,
                SWITCH_QUEUE_MODE,
                UPDATE_ACTIVE_BACKGROUND_TYPE,
                UPDATE_ACTIVE_VISUALIZER_TYPE,
                SWITCH_TO_VISUALIZER,
                SWITCH_TO_BACKGROUND,
                TRIGGER_BACKGROUND_EVENT,
                VISUALIZER_LISTEN_TO,
                BACKGROUND_LOAD_RESOURCE,
                VISUALIZER_LOAD_RESOURCE
            ]),

            ...mapActions([
                'triggerBackgroundEvent',
                'saveLayout'
            ])
        },

        async created() {
            this.player.on('progress', (soundId, progress) => {
                this.progress = progress;
            });

            this.player.on('end', () => {
                this.next();
            });

            if (this.track) {
                this.pic = applyCanvasMask(scale({ width: 200, height: 200 }, await loadImage(this.track.picture)), await loadImage(require('../assets/mask.png')), 200, 200, true);
            }
        },

        destroyed() {
            this.player.off('progress');
            this.player.off('end');
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
        padding: 4px;
        background-color: rgba(32, 32, 32, 0.30);
        background-image: url(../assets/highlight.svg),
            linear-gradient(rgba(255, 255, 255, .15) 10%, rgba(255, 255, 255, 0) 90%);
        background-position: 30% 0, center, 98% center;
        background-size: auto 100%, auto, 200px auto;
        background-repeat: no-repeat;
        box-shadow: 0 0 25px rgba(0, 0, 0, 0.1),
            inset 0 0 20px rgba(255, 255, 255, 0.1);
        z-index: 1;

        @media (max-width: 768px) {
            background-position: 30% 0, center, 100% center;
        }
    
        @media (min-width: 992px) {
            background-position: 30% 0, center, 2% center;
        }

        @media (min-width: 1280px) {
            background-size: auto 100%, auto, 300px auto;
        }

        .tool-bar {
            display: flex;
            flex-direction: row-reverse;
            align-items: center;
            justify-content: space-between;

            @media (max-width: 629px) {
                display: block;
            }

            .track-name {
                width: 50%;
                height: 20px;
                margin-left: calc(30% - 9vh - 55px);
            
                @media (max-width: 987px) {
                    width: 40%;
                }

                @media (max-width: 795px) {
                    margin-left: calc(30% - 9vh - 72px);
                }
    
                @media (max-width: 707px) {
                    width: 30%;
                }

                @media (max-width: 629px) {
                    width: auto;
                    margin: 0 calc(30% - 9vh - 72px);

                    .yoyo-marquee {
                        text-align: center;
                    }
                }

                @media (max-width: 516px) {
                    margin: 0 6px;
                }

                @media (max-width: 425px) {
                    margin: 0 calc(30% - 9vh - 16px);
                }

                @media (max-width: 377px) {
                    margin: 8px;
                }
            }

            .options {
                display: flex;
                justify-content: flex-end;
                height: 24px;
                margin-right: 8px;

                @media (max-width: 630px) {
                    margin-bottom: 10px;
                }

                select {
                    height: 24px;
                    width: 80px;
                    padding: 0;
                    max-width: calc((100% - 195px) / 2 - 16px);
                    margin: 0 8px;

                    option {
                        color: #000;
                    }
                }

                .btn-group {
                    width: 163px;
                    margin: 0 8px;

                    svg {
                        fill: #666;
                        vertical-align: middle;
                    }
                }
            }
        }

        .audio-control {
            display: flex;
            align-items: center;
            justify-content: center;

            .vue-slider-component {
                margin: 6px;

                @media (max-width: 445px) {
                    margin: 2px;
                }
            }

            .progress {
                @media (max-width: 445px) {
                    width: 45%;
                }
            }

            .time {
                color: #fff;
                text-align: center;
                white-space: nowrap;

                @media (max-width: 370px) {
                    display: none;
                }
            }

            .volume {
                @media (max-width: 788px) {
                    width: 15% !important;
                }

                @media (max-width: 445px) {
                    display: none;
                }
            }

            .mode-switch {
                @media (min-width: 370px) and (max-width: 629px) {
                    display: none;
                }
            }
        }

        .control-button {
            display: flex;
            justify-content: center;
            align-items: center;
            line-height: 0;
            cursor: pointer;

            svg {
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

            @media (max-width: 445px) {
                margin: 2px;
            }

            svg {
                width: 6vh;
                height: 6vh;
            }
        }

            /*.control-button_medium {*/
            /*margin: 5px;*/

            /*@media (max-width: 425px) {*/
            /*margin: 1px;*/
            /*}*/

            /*svg {*/
            /*width: 5vh;*/
            /*height: 5vh;*/
            /*}*/
            /*}*/

        .control-button_small {
            margin: 4px;

            @media (max-width: 445px) {
                margin: 1px;
            }

            svg {
                width: 4vh;
                height: 4vh;
            }
        }

        @keyframes loading {
            from {
                opacity: 1;
            }

            to {
                opacity: .5;
            }
        }

        .loading {
            animation: loading .5s cubic-bezier(.5, .1, .5,.9) infinite alternate;
        }
    }
</style>