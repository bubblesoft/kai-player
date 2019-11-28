<template lang="pug">
    .app(:style="{ backgroundImage: `url(${backgroundImage})` }")
        banner
        control-bar(@toggleSettingsModal="showSettings = !showSettings;")
        template(v-if="layout")
            transition(name="fade")
                pane-frame(
                    v-if="picturePanelOpen"
                    v-model="pictureLayout"
                    :heading="$t('Artwork')"
                    @close="picturePanelOpen = false;"
                )
                    picturePane
            transition(name="fade")
                pane-frame(
                    v-if="renderSourcePanel"
                    v-show="sourcePanelOpen"
                    v-model="sourceLayout"
                    :heading="$t('Media Source')"
                    @close="sourcePanelOpen = false;"
                )
                    sourcePane
            transition(name="fade")
                pane-frame(
                    v-if="renderListPanel"
                    v-show="listPanelOpen"
                    v-model="listLayout"
                    :heading="$t('Chart')"
                    @close="listPanelOpen = false;"
                )
                    listPane(@contextMenu="(e, callback) => { listContextMenuCallback = callback; $refs.listContextMenu.open(e); }")
            transition(name="fade")
                pane-frame(
                    v-if="renderSearchPanel"
                    v-show="searchPanelOpen"
                    v-model="searchLayout"
                    :heading="$t('Search')"
                    @close="searchPanelOpen = false;"
                )
                    searchPane(@contextMenu="(e, callback) => { searchContextMenuCallback = callback; $refs.searchContextMenu.open(e); }")
            transition(name="fade")
                pane-frame(
                    v-if="renderPlaylistPanel"
                    v-show="playlistPanelOpen"
                    v-model="playlistLayout"
                    :heading="$t('Playlist')"
                    @close="playlistPanelOpen = false;"
                )
                    playlistPane(@contextMenu="(e, callback) => { playlistContextMenuCallback = callback; $refs.playlistContextMenu.open(e); }")
            transition(name="fade")
                pane-frame(
                    v-if="renderTracksPanel"
                    v-show="tracksPanelOpen"
                    v-model="tracksLayout"
                    :heading="`${$t('Tracks')}(${queue && queue.name})`"
                    @close="tracksPanelOpen = false;"
                )
                    tracksPane(
                        @openQueueModal="selectQueueModalCallback = $event; showSelectQueueModal = true;"
                        @contextMenu="(e, callback) => { trackContextMenuCallback = callback; $refs.trackContextMenu.open(e); }"
                    )
        settings(
            v-if="renderSettings"
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
            li(v-interact:tap="() => { trackContextMenuCallback('copy'); }") {{ $t('Copy to...') }}
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

    import { INIT, INIT_PLAYER_MODULE, INIT_QUEUE_MODULE, FETCH_SOURCES } from "../scripts/action-types";
    import { UPDATE_QUEUE_GROUP, INSERT_QUEUE, UPDATE_PLAYING_QUEUE_INDEX, ADD_TRACK, UPDATE_ACTIVE_PANEL_INDEX, SET_MODE, LOAD_LAYOUT, BACKGROUND_LOAD_RESOURCE } from "../scripts/mutation-types";

    import TrackQueue from './queue/TrackQueue';
    import RandomTrackQueue from './queue/RandomTrackQueue';

    import { getRecommendedTrack, requestNetworkIdle } from '../scripts/utils';

    import contextMenu from 'vue-context-menu';

    import loading from './loading';
    import error from './error';
    import banner from './banner';
    import controlBar from './control-bar';
    import paneFrame from './pane-frame';
    import selectQueueModal from './select-queue-modal';

    const DESTROY_INSTANCE_TIMEOUT = 5 * 10000;

    let that;

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
            that = this;

            return {
                showSettings: false,
                renderSettings: false,
                renderSettingsTimeout: undefined,
                showSelectQueueModal: false,
                listContextMenuCallback: () => {},
                searchContextMenuCallback: () => {},
                selectQueueModalCallback: () => {},
                trackContextMenuCallback: () => {},
                playlistContextMenuCallback: () => {},
                renderSourcePanel: false,
                renderListPanel: false,
                renderSearchPanel: false,
                renderPlaylistPanel: false,
                renderTracksPanel: false,
                timeouts: new Map(),
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
                    return this.layout && this.layout.picture.visible;
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
                    return this.layout && this.layout.source.visible;
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
                    return this.layout && this.layout.list.visible;
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
                    return this.layout && this.layout.search.visible;
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
                    return this.layout && this.layout.playlist.visible;
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
                    return this.layout && this.layout.tracks.visible;
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
                backgroundImage: state => state.generalModule.backgroundImage,
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
                BACKGROUND_LOAD_RESOURCE
            ]),

            ...mapActions([
                INIT,
                INIT_PLAYER_MODULE,
                INIT_QUEUE_MODULE,
                FETCH_SOURCES,
                'initVisualization',
                'loadLayout',
                'saveLayout',
            ]),
        },

        watch: {
            showSettings(showSettings) {
                if (this.renderSettingsTimeout) {
                    clearTimeout(this.renderSettingsTimeout);
                    delete this.renderSettingsTimeout;
                }

                if (showSettings === true) {
                    return this.renderSettings = true;
                } else if (showSettings === false) {
                    this.renderSettingsTimeout = setTimeout(() => {
                        delete this.renderSettingsTimeout;
                        this.renderSettings = false;
                    }, 2000);
                }
            },

            ...["sourcePanel", "listPanel", "searchPanel", "playlistPanel", "tracksPanel"].reduce((map, key) => {
                map[`${key}Open`] = (open) => {
                    const renderKey = `render${key.slice(0, 1).toUpperCase()}${key.slice(1)}`;

                    if (open !== true) {
                        return that.timeouts.set(key, setTimeout(() => {
                            that.timeouts.delete(key);
                            that[renderKey] = false;
                        }, DESTROY_INSTANCE_TIMEOUT));
                    }

                    that[renderKey] = true;

                    const timeout = that.timeouts.get(key);

                    if (timeout) {
                        clearTimeout(timeout);
                        that.timeouts.delete(key);
                    }
                };

                return map;
            }, {}),
        },

        async created() {
            this[INIT]();
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
                        name: this.$t("Temp Playlist")
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

            if (this.queue && !this.queue.length && this.queue.name === this.$t("Temp Playlist")) {
                const track = await (async () => {
                    while (true) {
                        try {
                            return await getRecommendedTrack(null, await fetchSourcesPromises);
                        } catch (e) {
                            console.log(e);

                            await new Promise((resolve) => setTimeout(resolve, 200));
                        }
                    }
                })();

                this[ADD_TRACK]({ track });
                this[BACKGROUND_LOAD_RESOURCE]({ picture: track.picture });
            } else if (this.track) {
                this[BACKGROUND_LOAD_RESOURCE]({ picture: this.track.picture });
            }

            this.queueGroup.get().forEach(async (queue, i) => {
                if (queue.constructor === RandomTrackQueue && !queue.length) {
                    const track = await (async () => {
                        while (true) {
                            try {
                                return await getRecommendedTrack(null, await fetchSourcesPromises);
                            } catch (e) {
                                console.log(e);

                                await new Promise((resolve) => setTimeout(resolve, 200));
                            }
                        }
                    })();

                    this[ADD_TRACK]({
                        track,
                        queueIndex: i,
                    });
                }
            });

            requestNetworkIdle(() => this.renderSettings = true);
        },

        mounted() {
            this[SET_MODE](window.innerWidth < 600 ? "mobile" : "desktop");
            this.loadLayout({ mode: this.mode });
            document.body.addEventListener("click", this.blur);
            this.initVisualization(this.$el);

            ["sourcePanel", "listPanel", "searchPanel", "playlistPanel", "tracksPanel"].map((key) => {
                if (this[`${key}Open`] === true) {
                    this[`render${key.slice(0, 1).toUpperCase()}${key.slice(1)}`] = true;
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
