<template lang="pug">
    .list-pane(v-if="sources.length && sources.filter((source) => source.get() && source.get().length).length")
        .toolbar
            select.form-control.input-sm(v-model="sourceSelected")
                option(
                    value=""
                    disabled
                ) {{ $t('Select a media source') }}
                option(
                    v-for="source in sources"
                    :value="source"
                ) {{ source.name }}
            select.form-control.input-sm(
                v-if="sourceSelected"
                v-model="trackListSelected"
            )
                option(
                    value=""
                    disabled
                ) {{ $t('Select a channel') }}
                option(
                    v-for="channel in sourceSelected.get()"
                    :value="channel"
                ) {{ channel.name }}
        .list-wrap(
            ref="list"
            :class="{ blur: loading }"
        )
            table.table-condensed.table.table-hover
                draggable(
                    v-model="tracks"
                    :options="{ group: { name: 'tracks', pull: 'clone', put: false }, sort: false, handle: '.drag-handle', forceFallback: true, fallbackOnBody: true }"
                    @start="fixDrag();"
                    element="tbody"
                )
                    tr(
                        v-for="track in tracks"
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
                        td.drag-handle
                            svg(
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                            )
                                path(d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z")
        vueLoading(
            v-if="loading"
            type="cylon"
            color="#fff"
        )
    vueLoading(
        v-else
        type="cylon"
        color="#fff"
    )
</template>

<script>
    import { mapState, mapMutations, mapActions } from "vuex";

    import moment from 'moment';

    import { formatDuration } from '../../scripts/utils';

    import { UPDATE_QUEUE_GROUP, INSERT_QUEUE, UPDATE_QUEUE, UPDATE_PLAYING_QUEUE_INDEX, ADD_TRACK ,UPDATE_ACTIVE_VISUALIZER_TYPE, VISUALIZER_LOAD_RESOURCE } from "../../scripts/mutation-types";
    import { PLAY_TRACK } from "../../scripts/action-types";

    import TrackQueue from '../queue/TrackQueue';

    import draggable from 'vuedraggable';
    import vueLoading from 'vue-loading-template';

    export default {
        components: {
            draggable,
            vueLoading,
        },

        data() {
            return {
                sourceSelected: null,
                trackListSelected: null,
                tracks: [],
                loading: false,
            }
        },

        computed: {
            sources() {
              return this.sourceGroup.get();
            },

            queue() {
                return this.queueGroup.get(this.queueGroup.activeIndex || 0);
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
                    return this.visualizerType;
                },
                set(type) {
                    this[UPDATE_ACTIVE_VISUALIZER_TYPE](type);
                }
            },

            ...mapState({
                sourceGroup: state => state.sourceModule.sourceGroup,
                queueGroup: state => state.queueModule.queueGroup,
                playerController: state => state.playerModule.playerController,
                visualizerType: state => state.visualizationModule.visualizerType
            })
        },

        methods: {
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
                this.$emit('contextMenu', e, (type) => {
                    if (type === 'add') {
                        this.addToPlayback(track);
                    } else if ( type === 'import') {
                        this[INSERT_QUEUE]({
                            index: this.queueGroup.length,
                            queue: new TrackQueue({ name: `${this.trackListSelected.name}(${moment().format('YYYY-MM-DD')})` })
                        });

                        this[UPDATE_QUEUE_GROUP]({ activeIndex: this.queueGroup.length - 1 });

                        this.addToPlayback(this.tracks[0]);

                        this.tracks.slice(1).forEach(track => {
                            this[ADD_TRACK]({ track });
                        });
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
                UPDATE_QUEUE_GROUP,
                INSERT_QUEUE,
                UPDATE_QUEUE,
                UPDATE_PLAYING_QUEUE_INDEX,
                ADD_TRACK,
                UPDATE_ACTIVE_VISUALIZER_TYPE,
                VISUALIZER_LOAD_RESOURCE
            ]),

            ...mapActions([PLAY_TRACK]),
        },

        filters: {
            formatDuration
        },

        created() {
            if (this.sources.length) {
                this.sourceSelected = this.sources[0];
                this.trackListSelected = this.sourceSelected.get(0);
            }

            if (!this.trackListSelected) {
                const unwatch = this.$watch(() =>  this.sourceSelected, (sourceSelected) => {
                    if (sourceSelected.get(0)) {
                        unwatch();
                        this.trackListSelected = this.sourceSelected.get(0);
                    }
                });
            }
        },

        watch: {
            async trackListSelected(trackList) {
                if (trackList) {
                    this.loading = true;

                    try {
                        this.tracks = await trackList.get();
                        this.$refs.list.scrollTop = 0;
                    } catch (e) {
                        console.log(e);
                    }

                    this.loading = false;
                } else {
                    this.tracks = [];
                }
            },

            sources(sources) {
                this.sourceSelected = sources[0];
                this.trackListSelected = this.sourceSelected.get(0);
            },

            sourceSelected(source) {
                this.trackListSelected = source.get(0);
            }
        }
    }
</script>

<style lang="scss" scoped>
    .list-pane {
        height: 100%;

        .toolbar {
            display: flex;
            align-items: center;
            padding-bottom: 6px;
            box-shadow: inset 0 -2px 1px -1.5px rgba(0, 0, 0, 0.2);

            select {
                width: 50%;

                option {
                    color: #000;
                }
            }
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
