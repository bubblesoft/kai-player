<template lang="pug">
    #control-bar(
        :style="{ backgroundImage: performanceFactor >= .3 && pic && 'url(' + require('../assets/highlight.svg') + '),linear-gradient(rgba(255,255,255,.15) 10%,rgba(255,255,255,0) 90%),url(' + pic + ')' }"
        :class="{ 'performance-factor-max-2': performanceFactor < .2 }"
    )
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
                        v-for="type in background.types"
                        :value="type.value"
                    ) {{ $t(type.name) }}
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
                .control-button.glowing-button(
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
                    ref="trackName"
                    v-if="track"
                    :title="track.name + '-' + (track.artists && track.artists.map(artist => artist.name).join(', '))"
                )
                    span.track-name-content(ref="trackNameContent")
                        span(:style="{ color: usingAltTrack ? 'rgb(89, 192, 255)' : '#fff' }") {{ track.name || $t('Unknown Track') }} - {{ track.artists && track.artists.map(artist => artist.name).join(', ') || $t('Unknown Artist') }}
                span.track-notifications(v-if="track")
                    v-popover(
                        v-if="track.status === Status.Error"
                        delay="300"
                        placement="top"
                        trigger="hover click focus"
                    )
                        span.control-button.glowing-button
                            svg.error(
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                            )
                                path(d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z")
                        .error-messages(
                            slot="popover"
                            v-for="message of Array.from(track.messages)"
                        ) {{ $t(message.text) }}
                    v-popover(
                        v-else-if="track.status === Status.Warning"
                        delay="300"
                        placement="top"
                        trigger="hover click focus"
                    )
                        span.control-button.glowing-button
                            svg.warning(
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                            )
                                path(d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16")
                        .error-messages(
                            slot="popover"
                            v-for="message of Array.from(track.messages)"
                        ) {{ $t(message.text) }}
                    v-popover(
                        delay="300"
                        placement="top"
                        trigger="hover click focus"
                    )
                        span.control-button.glowing-button
                            svg.info(
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                            )
                                path(d="M12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,11A1,1 0 0,1 13,12A1,1 0 0,1 12,13A1,1 0 0,1 11,12A1,1 0 0,1 12,11M12,8C14.63,8 17,9.57 18,12C16.62,15.31 12.81,16.88 9.5,15.5C7.92,14.84 6.66,13.58 6,12C7,9.57 9.37,8 12,8M12,9.5A2.5,2.5 0 0,0 9.5,12A2.5,2.5 0 0,0 12,14.5A2.5,2.5 0 0,0 14.5,12A2.5,2.5 0 0,0 12,9.5")
                        div(slot="popover") Available in next release.

        .audio-control
            .control-button.control-button_small.glowing-button(v-interact:tap="previous")
                svg(
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                )
                    path(d="M6 6h2v12H6zm3.5 6l8.5 6V6z")
            .control-button.control-button_big.glowing-button(
                v-if="!playing()"
                v-interact:tap="play"
                :class="{ loading: loading || playerController.status === PlayerStatus.Loading || playerController.status === PlayerStatus.Streaming }"
                key="play"
            )
                svg(
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                )
                    path(d="M8 5v14l11-7z")
            .control-button.control-button_big.glowing-button(
                v-else
                v-interact:tap="pause"
                :class="{ loading: loading || playerController.status === PlayerStatus.Loading || playerController.status === PlayerStatus.Streaming }"
                key="pause"
            )
                svg(
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                )
                    path(d="M6 19h4V5H6v14zm8-14v14h4V5h-4z")
            .control-button.control-button_small.glowing-button(v-interact:tap="next")
                svg(
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                )
                    path(d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z")
            .control-button.control-button_small.glowing-button(v-interact:tap="stop")
                svg(
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                )
                    path(d="M6 6h12v12H6z")
            vue-slider.progress(
                @callback="changeProgress($event)"
                :value="progress"
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
                :formatter="(v) => `${(v * 100).toFixed(0)}`"
                :bg-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)' }"
                :slider-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)' }"
                :process-style="{ 'background-color': 'rgba(255, 255, 255, 0.9)', filter: 'drop-shadow(2px 2px 10px rgba(150, 150, 150, 1))' }"
                :tooltip-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)', 'border-color': 'rgba(255, 255, 255, 0.6)', 'border-style': 'none' }"
            )
            .mode-switch.control-button.glowing-button(
                v-if="mode === 'shuffle'"
                v-interact:tap="() => { SWITCH_QUEUE_MODE(); }"
                v-tooltip="Object.assign({}, { content: $t('Shuffle') }, tooltipConfig)"
            )
                svg(
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                )
                    path(d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z")
            .mode-switch.control-button.glowing-button(
                v-else-if="mode === 'repeatOne'"
                v-interact:tap="() => { SWITCH_QUEUE_MODE(); }"
                v-tooltip="Object.assign({}, { content: $t('Repeat one') }, tooltipConfig)"
            )
                svg(
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                )
                    path(d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z")
            .mode-switch.control-button.glowing-button(
                v-else
                v-interact:tap="() => { SWITCH_QUEUE_MODE(); }"
                v-tooltip="Object.assign({}, { content: $t('Repeat all') }, tooltipConfig)"
            )
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

    import Status from "./Status";
    import PlayerStatus from "./PlayerStatus";
    import RandomTrackQueue from "./queue/RandomTrackQueue";

    import { UPDATE_PROGRESS, UPDATE_STATE_PROGRESS, PAUSE_PLAYBACK, ADD_TRACK, UPDATE_TRACK, SWITCH_QUEUE_MODE, UPDATE_ACTIVE_BACKGROUND_TYPE, UPDATE_ACTIVE_VISUALIZER_TYPE, BACKGROUND_LOAD_RESOURCE, VISUALIZER_LOAD_RESOURCE } from '../scripts/mutation-types';
    import { PLAY_TRACK, STOP_PLAYBACK, RESUME_PLAYBACK, FETCH_NEXT_TRACK_FOR_RANDOM_QUEUE, TRIGGER_BACKGROUND_EVENT } from "../scripts/action-types";

    import vueSlider from 'vue-slider-component';
    import checkbox from 'vue-strap/src/checkbox';

    import yoyoMarquee from './yoyo-marquee';

    import { formatDuration, loadImage, requestNetworkIdle } from "../scripts/utils";

    import config from "../config";

    export default {
        components: {
            vueSlider,
            checkbox,
            yoyoMarquee
        },

        data: () => {
            return {
                volume: .5,
                pic: '',
                loading: false,
                inlineError: false,
                tooltipConfig: {
                    delay: 500,
                    trigger: "hover click focus",
                },
                fetchingNext: false,
                Status,
                PlayerStatus,
            }
        },

        computed: {
            track() {
                return this.queue ? this.queue.get(this.queue.activeIndex || 0) : null;
            },

            progress: {
                get() {
                    return this.$store.state.playerModule.progress;
                },

                set(progress) {
                    this[UPDATE_PROGRESS](progress);
                    this[UPDATE_STATE_PROGRESS](progress);
                }
            },

            duration() {
                return this.playerController.duration
                    || this.track && this.track.duration && Math.round((this.track.duration) / 1000)
                    || this.$store.state.playerModule.duration
                    || 0;
            },

            usingAltTrack() {
                return this.playerController.usingAltTrack;
            },

            mode() {
                return this.queue && this.queue.mode;
            },

            activeBackgroundType: {
                get() {
                    return this.$store.state.visualizationModule.backgroundType;
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
                return this.sourceGroup.get();
            },

            performanceFactor() {
                return this.preference.performanceFactor;
            },

            ...mapState({
                playingQueueIndex: (state) => state.queueModule.playingQueueIndex,
                queue: (state) => state.queueModule.queueGroup.get(state.queueModule.playingQueueIndex || 0),
                playerController: state => state.playerModule.playerController,
                sourceGroup: state => state.sourceModule.sourceGroup,
                visualizationInit: state => state.visualizationModule.init,
                background: state => state.visualizationModule._background,
                visualizer: state => state.visualizationModule._visualizer,
                layout: state => state.generalModule.layout,
                preference: (state) => state.generalModule.preference || config.defaultPreference,
            })
        },

        watch: {
            volume(volume) {
                this.playerController.volume = volume;
            },

            async track(to) {
                if (to && to.picture) {
                    requestNetworkIdle(async () => {
                        try {
                            this.pic = applyCanvasMask(scale({ width: 200, height: 200 }, await loadImage(to.picture)), await loadImage(require('../assets/mask.png')), 200, 200, true);
                        } catch (e) {
                            this.pic = null;
                        }
                    });
                } else {
                    this.pic = null;
                }

                if (this.$refs.trackNameContent) {
                    this.inlineError = this.$refs.trackNameContent.offsetWidth < this.$refs.trackName.$el.offsetWidth;
                }
            }
        },

        methods: {
            formatDuration,

            playing() {
                return this.playerController.status === PlayerStatus.Playing
                    || this.playerController.status === PlayerStatus.Streaming;
            },

            ready() {
                return this.playerController.status === PlayerStatus.Loaded
                    || this.playerController.status === PlayerStatus.Playing
                    || this.playerController.status === PlayerStatus.Paused
                    || this.playerController.status === PlayerStatus.Streaming;
            },

            async play() {
                if (this.playerController.status === PlayerStatus.Paused) {
                    this[RESUME_PLAYBACK]();
                } else {
                    if (this.queue.activeIndex !== null) {
                        this[PLAY_TRACK]({ index: this.queue.activeIndex });
                    } else {
                        this.loading = true;

                        this[PLAY_TRACK]({
                            index: await new Promise((resolve) => {
                                const unwatch = this.$watch("track", () => {
                                    unwatch();
                                    this.loading = false;

                                    resolve(this.queue.activeIndex);
                                });
                            })
                        });
                    }
                }
            },

            pause() {
                this[PAUSE_PLAYBACK]();
            },

            stop() {
                this.loading = false;
                this[STOP_PLAYBACK]();
            },

            changeProgress(progress) {
                this.progress = progress;
            },

            async previous() {
                const eventPromise = this[TRIGGER_BACKGROUND_EVENT]("previousTrack");

                this[PLAY_TRACK]({ index: this.queue.previous() });
                await eventPromise;
            },

            async next() {
                const eventPromise = this[TRIGGER_BACKGROUND_EVENT]("nextTrack");

                this.playerController.stop();

                if (this.queue.constructor === RandomTrackQueue && !this.queue.getNext()) {
                    if (this.fetchingNext) {
                        return;
                    }

                    this.loading = true;
                    this.fetchingNext = true;
                    await this[FETCH_NEXT_TRACK_FOR_RANDOM_QUEUE]({ queueIndex: this.playingQueueIndex });
                    this.loading = false;
                    this.fetchingNext = false;
                }

                this[PLAY_TRACK]({ index: this.queue.next() });
                await eventPromise;
            },

            toggleSettingsModal() {
                setTimeout(() => { this.$emit('toggleSettingsModal'); }, 350);
            },

            ...mapMutations([
                UPDATE_PROGRESS,
                UPDATE_STATE_PROGRESS,
                PAUSE_PLAYBACK,
                ADD_TRACK,
                UPDATE_TRACK,
                SWITCH_QUEUE_MODE,
                UPDATE_ACTIVE_BACKGROUND_TYPE,
                UPDATE_ACTIVE_VISUALIZER_TYPE,
                BACKGROUND_LOAD_RESOURCE,
                VISUALIZER_LOAD_RESOURCE
            ]),

            ...mapActions([
                PLAY_TRACK,
                STOP_PLAYBACK,
                RESUME_PLAYBACK,
                FETCH_NEXT_TRACK_FOR_RANDOM_QUEUE,
                TRIGGER_BACKGROUND_EVENT,
                'saveLayout'
            ])
        },

        async created() {
            if (this.track && this.track.picture) {
                try {
                    this.pic = applyCanvasMask(scale({ width: 200, height: 200 }, await loadImage(this.track.picture)), await loadImage(require('../assets/mask.png')), 200, 200, true);
                } catch (e) { }
            }
        },

        mounted() {
            if (this.$refs.trackNameContent) {
                this.inlineError = this.$refs.trackNameContent.offsetWidth < this.$refs.trackName.$el.offsetWidth;
            }
        },
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
        z-index: 2;

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
                display: flex;
                align-items: center;
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
                    justify-content: center;
                    width: auto;
                    margin: 0 calc(30% - 9vh - 72px);
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

                .track-name-content {
                    display: inline-flex;
                    align-items: center;
                }

                .track-notifications {
                    display: flex;
                    margin-left: 5px;
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

            .progress, .volume {
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

        &.performance-factor-max-2 {
            background: transparent none !important;
            border-top: 1px solid #3c3c3c;
            box-shadow: none;
        }
    }

    .error-messages {
        text-align: left;
    }
</style>
