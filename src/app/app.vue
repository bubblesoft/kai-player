<template lang="pug">
    .app(:style="{ backgroundImage: `url(${backgroundImage})` }")
        banner
        control-bar(@toggleSettingsModal="showSettings = !showSettings;")
        template(v-if="layout")
            transition(name="fade")
                pane-frame(
                    v-if="picturePanelOpen"
                    v-model="pictureLayout"
                    heading="Artwork"
                    @close="picturePanelOpen = false;"
                )
                    picturePane
            transition(name="fade")
                pane-frame(
                    v-if="sourcePanelLoaded"
                    v-show="sourcePanelOpen"
                    v-model="sourceLayout"
                    heading="Media Source"
                    @close="sourcePanelOpen = false;"
                )
                    sourcePane
            transition(name="fade")
                pane-frame(
                    v-if="listPanelLoaded"
                    v-show="listPanelOpen"
                    v-model="listLayout"
                    heading="Chart"
                    @close="listPanelOpen = false;"
                )
                    listPane(@contextMenu="(e, callback) => { listContextMenuCallback = callback; $refs.listContextMenu.open(e); }")
            transition(name="fade")
                pane-frame(
                    v-if="searchPanelLoaded"
                    v-show="searchPanelOpen"
                    v-model="searchLayout"
                    heading="Search"
                    @close="searchPanelOpen = false;"
                )
                    searchPane(@contextMenu="(e, callback) => { searchContextMenuCallback = callback; $refs.searchContextMenu.open(e); }")
            transition(name="fade")
                pane-frame(
                    v-if="playlistPanelLoaded"
                    v-show="playlistPanelOpen"
                    v-model="playlistLayout"
                    heading="Playlist"
                    @close="playlistPanelOpen = false;"
                )
                    playlistPane(@contextMenu="(e, callback) => { playlistContextMenuCallback = callback; $refs.playlistContextMenu.open(e); }")
            transition(name="fade")
                pane-frame(
                    v-if="tracksPanelLoaded"
                    v-show="tracksPanelOpen"
                    v-model="tracksLayout"
                    heading="Tracks"
                    @close="tracksPanelOpen = false;"
                )
                    tracksPane(
                        @openQueueModal="selectQueueModalCallback = $event; showSelectQueueModal = true;"
                        @contextMenu="(e, callback) => { trackContextMenuCallback = callback; $refs.trackContextMenu.open(e); }"
                    )
        settings(
            v-if="showSettings"
            v-model="showSettings"
        )
        selectQueueModal(
            v-model="showSelectQueueModal"
            :callback="selectQueueModalCallback"
        )
        contextMenu(ref="listContextMenu")
            li(v-interact:tap="() => { listContextMenuCallback('add'); }") {{ $t('Add to playlist') }}
            li(v-interact:tap="() => { listContextMenuCallback('import'); }") {{ $t('Import all as a playlist') }}
        contextMenu(ref="searchContextMenu")
            li(v-interact:tap="() => { searchContextMenuCallback('add'); }") {{ $t('Add to playlist') }}
        contextMenu(ref="trackContextMenu")
            li(v-interact:tap="() => { trackContextMenuCallback('play'); }") {{ $t('Play') }}
            li(v-interact:tap="() => { trackContextMenuCallback('up'); }") {{ $t('Move up') }}
            li(v-interact:tap="() => { trackContextMenuCallback('down'); }") {{ $t('Move down') }}
            li(v-interact:tap="() => { trackContextMenuCallback('move'); }") {{ $t('Move to...') }}
            li(v-interact:tap="() => { trackContextMenuCallback('remove'); }") {{ $t('Remove') }}
        contextMenu(ref="playlistContextMenu")
            li(v-interact:tap="() => { playlistContextMenuCallback('open'); }") {{ $t('Select') }}
            li(v-interact:tap="() => { playlistContextMenuCallback('up'); }") {{ $t('Move up') }}
            li(v-interact:tap="() => { playlistContextMenuCallback('down'); }") {{ $t('Move down') }}
            li(v-interact:tap="() => { playlistContextMenuCallback('create'); }") {{ $t('New') }}
            li(v-interact:tap="() => { playlistContextMenuCallback('remove'); }") {{ $t('Remove') }}
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';

    import interact from 'interactjs';

    import { INIT_PLAYER_MODULE, INIT_QUEUE_MODULE, FETCH_SOURCES } from "../scripts/action-types";
    import { UPDATE_QUEUE_GROUP, INSERT_QUEUE, UPDATE_PLAYING_QUEUE_INDEX, ADD_TRACK, UPDATE_ACTIVE_PANEL_INDEX, SET_MODE, LOAD_LAYOUT, SWITCH_TO_BACKGROUND, VISUALIZER_LISTEN_TO, BACKGROUND_LOAD_RESOURCE } from "../scripts/mutation-types";

    import TrackQueue from './queue/TrackQueue';
    import RandomTrackQueue from './queue/RandomTrackQueue';

    import { getRecommendedTrack } from '../scripts/utils';

    import contextMenu from 'vue-context-menu';

    import loading from './loading';
    import error from './error';
    import banner from './banner';
    import controlBar from './control-bar';
    import paneFrame from './pane-frame';
    import selectQueueModal from './select-queue-modal';

    export default {
        components: {
            loading,
            error,
            contextMenu,
            banner,
            controlBar,
            paneFrame,
            picturePane: () => ({
                component: import('./queue/picture-pane'),
                loading,
                error,
                timeout: 30000
            }),
            sourcePane: () => ({
                component: import('./source/source-pane'),
                loading,
                error,
                timeout: 30000
            }),
            searchPane: () => ({
                component: import('./source/search-pane'),
                loading,
                error,
                timeout: 30000
            }),
            listPane: () => ({
                component: import('./source/list-pane'),
                loading,
                error,
                timeout: 30000
            }),
            playlistPane: () => ({
                component: import('./queue/playlist-pane'),
                    loading,
                    error,
                    timeout: 30000
            }),
            tracksPane: () => ({
                component: import('./queue/tracks-pane'),
                    loading,
                    error,
                    timeout: 30000
            }),
            settings: () => ({
                component: import('./settings'),
                loading,
                error,
                timeout: 30000
            }),
            selectQueueModal,
        },

        data() {
            return {
                showSettings: false,
                showSelectQueueModal: false,
                listContextMenuCallback: () => {},
                searchContextMenuCallback: () => {},
                selectQueueModalCallback: () => {},
                trackContextMenuCallback: () => {},
                playlistContextMenuCallback: () => {},
                sourcePanelLoaded: false,
                listPanelLoaded: false,
                searchPanelLoaded: false,
                playlistPanelLoaded: false,
                tracksPanelLoaded: false,
            }
        },

        computed: {
            track() {
                return this.queue ? this.queue.get(this.queue.activeIndex) : null;
            },

            pictureLayout: {
                get() {
                    return this.layout.picture;
                },
                set(layout) {
                    this.saveLayout({
                        index: 'picture',
                        layout
                    });
                }
            },
            sourceLayout: {
                get() {
                    return this.layout.source;
                },
                set(layout) {
                    this.saveLayout({
                        index: 'source',
                        layout
                    });
                }
            },
            listLayout: {
                get() {
                    return this.layout.list;
                },
                set(layout) {
                    this.saveLayout({
                        index: 'list',
                        layout
                    });
                }
            },
            searchLayout: {
                get() {
                    return this.layout.search
                },
                set(layout) {
                    this.saveLayout({
                        index: 'search',
                        layout
                    });
                }
            },
            playlistLayout: {
                get() {
                    return this.layout.playlist;
                },
                set(layout) {
                    this.saveLayout({
                        index: 'playlist',
                        layout
                    });
                }
            },
            tracksLayout: {
                get() {
                    return this.layout.tracks;
                },
                set(layout) {
                    this.saveLayout({
                        index: 'tracks',
                        layout
                    });
                }
            },

            picturePanelOpen: {
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

            sourcePanelOpen: {
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

            listPanelOpen: {
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

            searchPanelOpen: {
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

            playlistPanelOpen: {
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

            tracksPanelOpen: {
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

            queue() {
                return this.queueGroup.get(this.queueGroup.activeIndex || 0);
            },

            ...mapState({
                panels: state => state.generalModule.panels,
                lockActivePanelIndex: state => state.generalModule.activePanel.lock,
                player: state => state.playerModule.playerController.player,
                queueGroup: state => state.queueModule.queueGroup,
                background: state => state.visualizationModule._background,
                visualizer: state => state.visualizationModule._visualizer,
                mode: state => state.generalModule.mode,
                layout: state => state.generalModule.layout,
                backgroundImage: state => state.generalModule.backgroundImage
            })
        },

        methods: {
            blur() {
                if (!this.lockActivePanelIndex) {
                    this[UPDATE_ACTIVE_PANEL_INDEX](null);
                }
            },

            ...mapMutations([
                UPDATE_QUEUE_GROUP,
                INSERT_QUEUE,
                UPDATE_PLAYING_QUEUE_INDEX,
                ADD_TRACK,
                UPDATE_ACTIVE_PANEL_INDEX,
                SET_MODE,
                LOAD_LAYOUT,
                SWITCH_TO_BACKGROUND,
                VISUALIZER_LISTEN_TO,
                BACKGROUND_LOAD_RESOURCE
            ]),
            ...mapActions([
                INIT_PLAYER_MODULE,
                INIT_QUEUE_MODULE,
                FETCH_SOURCES,
                'initVisualization',
                'loadLayout',
                'saveLayout',
            ])
        },

        async created() {
            this[INIT_PLAYER_MODULE]();

            const initQueueModulePromise = this[INIT_QUEUE_MODULE]();
            const fetchSourcesPromises = this[FETCH_SOURCES]();
            const interactable = interact(document.body);

            if (this.visualizer) {
                interactable.on("tap", () => {
                    interactable.unset();

                    this.visualizer._clubber.context.resume();
                });
            } else {
                const unwatch = this.$watch("visualizer", () => {
                    if (this.visualizer) {
                        unwatch();

                        interactable.on("tap", () => {
                            interactable.unset();

                            this.visualizer._clubber.context.resume();
                        });
                    }
                });
            }

            await initQueueModulePromise;

            if (!this.queueGroup.length) {
                this[INSERT_QUEUE]({
                    index: 0,
                    queue: new TrackQueue({
                        name: this.$t('Temp')
                    })
                });

                this[INSERT_QUEUE]({
                    index: 0,
                    queue: new RandomTrackQueue({
                        name: this.$t('Listen Randomly')
                    })
                });

                this[UPDATE_QUEUE_GROUP]({ activeIndex: 1 });
                this[UPDATE_PLAYING_QUEUE_INDEX](1);
            }

            if (this.queue && this.queue.constructor === RandomTrackQueue || !this.queue.length && this.queue.name === this.$t("Temp")) {
                const track = await getRecommendedTrack(null, await fetchSourcesPromises);

                this[ADD_TRACK]({ track });
                this[BACKGROUND_LOAD_RESOURCE]({ picture: track.picture });
            } else {
                this[BACKGROUND_LOAD_RESOURCE]({ picture: this.track.picture });
            }
        },

        mounted() {
            this[SET_MODE](window.innerWidth < 600 ? "mobile" : "desktop");
            this.loadLayout({ mode: this.mode });
            document.body.addEventListener("click", this.blur);
            this.initVisualization(this.$el);

            ["sourcePanel", "listPanel", "searchPanel", "playlistPanel", "tracksPanel"].map((key) => {
                if (this[`${key}Open`] === true) {
                    this[`${key}Loaded`] = true;
                } else {
                    const unwatch = this.$watch(`${key}Open`, () => {
                        unwatch();

                        this[`${key}Loaded`] = true;
                    });
                }
            });
        },

        destroyed() {
            document.body.removeEventListener('click', this.blur);
        }
    }
</script>

<style lang="scss" scoped>
    .app {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        z-index: 1;
        user-select: none;
        -moz-user-select: none;

        ::-webkit-scrollbar {
            width: 5px;
        }

        ::-webkit-scrollbar-button {
            display: none;
        }

        ::-webkit-scrollbar-track {
            display: none;
        }

        ::-webkit-scrollbar-thumb {
            border-radius: 2px;
            background-color: #3e3e3e;
        }

        .ctx-menu-container li {
            padding: 5px 10px;
            font-size: 14px;

            &:hover {
                background-color: #eee;
            }
        }
    }


    /* Animation */

    .fade-enter-active {
        transition: opacity .3s cubic-bezier(.32,0,0,1);
    }

    .fade-leave-active {
        transition: opacity .3s cubic-bezier(.32,0,0,1);
    }

    .fade-enter, .fade-leave-active {
        opacity: 0 !important;
    }
</style>

<style lang="scss">
    .blur {
        filter: blur(1px);
        transition-duration: 0s;
    }
</style>
