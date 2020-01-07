<template lang="pug">
    .search-pane(
        v-if="sources.length"
        :class="{ 'performance-factor-max-3': performanceFactor < .3 }"
    )
        .toolbar
            .input-group.input-group-sm
                input.form-control(
                    v-model="keywords"
                    @keyup.enter="search(keywords)"
                    :placeholder="$t('Search for music')"
                    type="text"
                )
                span.input-group-btn
                    button.btn.btn-default(
                        v-interact:tap="() => { search(keywords); }"
                        type="button"
                    ) {{ $t('Search') }}
        .list-wrap(
            ref="list"
            :class="{ blur: searching }"
        )
            table.table-condensed.table.table-hover
                component(
                    :is="performanceFactor >= .4 ? 'draggable' : 'tbody'"
                    v-model="tracks"
                    :options="{ group: { name: 'tracks', pull: 'clone', put: false }, sort: false, handle: '.drag-handle', forceFallback: true, fallbackOnBody: true }"
                    @start="fixDrag();"
                    element="tbody"
                )
                    tr(
                        v-for="track in tracksToRender"
                        v-interact:doubletap="() => { addToPlayback(track); }"
                        @contextmenu.prevent="handleContextMenu($event, track);"
                    )
                        td(style="padding: 0;")
                        td {{ track.name }}
                        td {{ track.artists.map(artist => artist.name).join(', ') }}
                        td(
                            v-if="track.duration"
                            style="width:46px"
                        ) {{ track.duration | formatDuration('mm:ss') }}
                        td(v-else)
                        td(v-if="showSourceIcon")
                            img(
                                :src="track.source.icons[0]"
                                :alt="track.source.name"
                                :title="track.source.name"
                            )
                        td.drag-handle(v-if="performanceFactor >= .4")
                            svg(
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                            )
                                path(d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z")
        loading(v-if="loading")
    loading(v-else)
</template>

<script>
    import { mapState, mapMutations, mapActions } from "vuex";

    import { getSourceById, formatDuration } from "../../scripts/utils";

    import { UPDATE_QUEUE, UPDATE_PLAYING_QUEUE_INDEX, ADD_TRACK, UPDATE_TRACK, UPDATE_ACTIVE_VISUALIZER_TYPE, VISUALIZER_LOAD_RESOURCE } from '../../scripts/mutation-types';
    import { PLAY_TRACK } from "../../scripts/action-types";

    import PlaybackSource from "../PlaybackSource";
    import Track from "../Track";
    import Artist from "../Artist";

    import draggable from 'vuedraggable';

    import loading from "../loading";

    import config from "../../config";

    let controller = new AbortController;

    export default {
        components: {
            draggable,
            loading,
        },
        data() {
          return {
              keywords: '',
              tracksWithSimilarity: [],
              loading: false,
              searching: false,
          }
        },
        computed: {
            tracks() {
                return this.tracksWithSimilarity.map((trackWithSimilarity) => trackWithSimilarity[0]);
            },

            tracksToRender() {
                if (this.performanceFactor < .1) {
                    return this.tracks.slice(0, 10);
                } else if (this.performanceFactor < .6) {
                    return this.tracks.slice(0, this.performanceFactor * 100);
                }

                return this.tracks;
            },

            sources() {
                return this.sourceGroup.get();
            },

            queue() {
                return this.queueGroup.get(this.queueGroup.activeIndex);
            },

            player() {
                return this.playerController.player;
            },

            playingQueueIndex: {
                get() {
                    return this.$store.state.queueModule.playingQueueIndex;
                },
                set(index) {
                    this[UPDATE_PLAYING_QUEUE_INDEX](index);
                }
            },

            activeVisualizerType: {
                get() {
                    return this.visualizer.activeType;
                },
                set(type) {
                    this[UPDATE_ACTIVE_VISUALIZER_TYPE](type);
                }
            },

            performanceFactor() {
                return this.preference.performanceFactor;
            },

            ...mapState({
                sourceGroup: state => state.sourceModule.sourceGroup,
                queueGroup: state => state.queueModule.queueGroup,
                playerController: state => state.playerModule.playerController,
                visualizer: state => state.visualizationModule.visualizer,
                i18next: state => state.generalModule.i18next,
                showSourceIcon: state => state.generalModule.showSourceIcon,
                preference: (state) => state.generalModule.preference || config.defaultPreference,
            })
        },
        methods: {
            async search(keywords) {
                const sources = this.sources;

                const activeSources = sources.filter(source => source.active)
                    .map(source => source.id);

                controller.abort();

                this.$nextTick(async () => {
                    controller = new AbortController;
                    this.loading = true;
                    this.searching = true;

                    let hasResult = false;

                    const searchPromises = activeSources.map(async (activeSource) => {
                        const tracksWithSimilarity = (await (await fetch('/audio/search', {
                            method: 'POST',
                            body: JSON.stringify({
                                keywords,
                                sources: [activeSource],
                            }),
                            headers: new Headers({
                                'Content-Type': 'application/json'
                            }),
                            signal: controller.signal
                        })).json()).data.map((trackData) => {
                            return [new Track(trackData.id, trackData.name, getSourceById(trackData.source, sources), {
                                duration: trackData.duration || null,
                                artists: trackData.artists.map(artist => new Artist({ name: artist.name })),

                                picture: (() => {
                                    if (!trackData.picture) {
                                        return null;
                                    }

                                    return `/proxy/${trackData.picture}`;

                                })(),

                                playbackSources: trackData.playbackSources && trackData.playbackSources
                                    .map((playbackSource) => new PlaybackSource(playbackSource.urls.map((url) => `/proxy/${url}`), playbackSource.quality, {
                                        proxied: true,
                                        statical: playbackSource.statical,
                                    }))
                                    .concat((() => trackData.playbackSources
                                        .map((playbackSource) => playbackSource.cached ? undefined : new PlaybackSource(playbackSource.urls, playbackSource.quality, {
                                            proxied: false,
                                            statical: playbackSource.statical,
                                        }))
                                        .filter((playbackSource) => playbackSource))()),

                                sources: this.sources,
                            }), trackData.similarity];
                        });

                        if (!hasResult && tracksWithSimilarity.length) {
                            hasResult = true;
                            this.tracksWithSimilarity = [];
                            this.loading = false;
                        }

                        this.tracksWithSimilarity = this.tracksWithSimilarity
                            .concat(tracksWithSimilarity)
                            .sort(([trackA, similarityA], [trackB, similarityB]) => {
                                if (similarityA !== similarityB) {
                                    return similarityB - similarityA;
                                }

                                return trackB.source.priority - trackA.source.priority;
                            });

                        this.$refs.list.scrollTop = 0;
                    });

                    (async () => {
                        try {
                            await Promise.all(searchPromises);

                            if (!hasResult) {
                                this.loading = false;
                            }

                            this.searching = false;
                        } catch (e) { }
                    })();

                    (async () => {
                        await Promise.allSettled(searchPromises);

                        if (!this.loading) {
                            this.searching = false;
                        }
                    })();
                });
            },

            async addToPlayback(track) {
                this[ADD_TRACK]({ track });

                this[UPDATE_QUEUE]({
                    index: this.queueGroup.activeIndex,
                    activeIndex: this.queue.getLastIndex(),
                });

                this[UPDATE_PLAYING_QUEUE_INDEX](this.queueGroup.activeIndex);
                this[PLAY_TRACK]({ index: this.queue.activeIndex });
            },

            handleContextMenu(e, track) {
                this.$emit('contextMenu', e, type => {
                    if (type === 'add') {
                        this.addToPlayback(track);
                    }
                });
            },

            fixDrag() {
                const el = document.querySelector('.sortable-fallback');
                if (el) {
                    el.style.width = this.$refs.list.offsetWidth;
                }
            },

            ...mapMutations([
                UPDATE_QUEUE,
                UPDATE_PLAYING_QUEUE_INDEX,
                ADD_TRACK,
                UPDATE_TRACK,
                UPDATE_ACTIVE_VISUALIZER_TYPE,
                VISUALIZER_LOAD_RESOURCE
            ]),

            ...mapActions([PLAY_TRACK]),
        },
        filters: {
            formatDuration
        }
    }
</script>

<style lang="scss" scoped>
    .search-pane {
        height: 100%;

        .toolbar {
            box-shadow: inset 0 -2px 1px -1.5px rgba(0, 0, 0, 0.2);
            padding-bottom: 6px;
        }

        .list-wrap {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: calc(100% - 36px);
            margin-top: 36px;
            box-shadow: inset 0 2px 1px -1.5px rgba(255, 255, 255, 0.2);
            overflow: auto;
            transition: filter .5s;
        }

        .vue-loading {
            top: 36px;
        }

        &.performance-factor-max-3 {
            .toolbar {
                box-shadow: none;
                border-bottom: 1px solid rgb(30, 30, 30);
            }

            .list-wrap {
                box-shadow: none;
                border-top: 1px solid rgb(60, 60, 60);
            }
        }
    }

    tr {
        cursor: default;

        &.sortable-ghost {
            opacity: .5 !important;
        }

        td {
            word-wrap: break-word;
            word-break: break-all;

            &.drag-handle {
                width: 28px;
                text-align: center;
                cursor: move;
                cursor: -webkit-grab;
            }

            svg {
                width: 18px;
                height: 18px;
                fill: #fff;
            }

            img {
                vertical-align: top;
                width: 15px;
                height: 15px;
                margin-top: 2px;
            }
        }
    }

    .sortable-fallback {
        display: table;
        position: absolute;
        color: #fff;
        opacity: .5;

        td {
            padding: 5px;
        }
    }

    .vue-loading {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
    }

    .random-queue-box tr {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(51, 122, 183, .2);

        td {
            display: none;
        }
    }
</style>
