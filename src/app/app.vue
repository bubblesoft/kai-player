<template lang="pug">
    .app(:style="{ backgroundImage: `url(${backgroundImage})` }")
        banner
        control-bar(@toggleSettingsModal="showSettings = !showSettings;")
        template(v-if="layout")
            transition(name="fade")
                pane-frame(
                    v-if="pictureOpen"
                    v-model="pictureLayout"
                    heading="Artwork"
                    @close="pictureOpen = false;"
                )
                    picturePane
            transition(name="fade")
                pane-frame(
                    v-show="sourceOpen"
                    v-model="sourceLayout"
                    heading="Media Source"
                    @close="sourceOpen = false;"
                )
                    sourcePane
            transition(name="fade")
                pane-frame(
                    v-show="listOpen"
                    v-model="listLayout"
                    heading="Chart"
                    @close="listOpen = false;"
                )
                    listPane(@contextMenu="listContextMenuCallback = $event; $refs.listContextMenu.open();")
            transition(name="fade")
                pane-frame(
                    v-show="searchOpen"
                    v-model="searchLayout"
                    heading="Search"
                    @close="searchOpen = false;"
                )
                    searchPane(@contextMenu="searchContextMenuCallback = $event; $refs.searchContextMenu.open();")
            transition(name="fade")
                pane-frame(
                    v-if="playlistOpen"
                    v-model="playlistLayout"
                    heading="Playlist"
                    @close="playlistOpen = false;"
                )
                    playlistPane(@contextMenu="playlistContextMenuCallback = $event; $refs.playlistContextMenu.open();")
            transition(name="fade")
                pane-frame(
                    v-if="tracksOpen"
                    v-model="tracksLayout"
                    heading="Tracks"
                    @close="tracksOpen = false;"
                )
                    tracksPane(
                        @openQueueModal="selectQueueModalCallback = $event; showSelectQueueModal = true;"
                        @contextMenu="trackContextMenuCallback = $event; $refs.trackContextMenu.open();"
                    )
        settings(v-model="showSettings")
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
            li(v-interact:tap="() => { trackContextMenuCallback('move'); }") {{ $t('Move to...') }}
            li(v-interact:tap="() => { trackContextMenuCallback('remove'); }") {{ $t('Remove') }}
        contextMenu(ref="playlistContextMenu")
            li(v-interact:tap="() => { playlistContextMenuCallback('open'); }") {{ $t('Select') }}
            li(v-interact:tap="() => { playlistContextMenuCallback('create'); }") {{ $t('New') }}
            li(v-interact:tap="() => { playlistContextMenuCallback('remove'); }") {{ $t('Remove') }}
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';

    import { ADD_SOURCES, UPDATE_QUEUE_GROUP, INSERT_QUEUE, UPDATE_PLAYING_QUEUE_INDEX, ADD_TRACK, UPDATE_ACTIVE_PANEL_INDEX, SET_MODE, LOAD_LAYOUT, SAVE_LAYOUT, SWITCH_TO_BACKGROUND, BACKGROUND_LOAD_RESOURCE } from '../scripts/mutation-types';

    import Source from './source/Source';
    import Channel from './source/Channel';
    import Queue from './queue/Queue';
    import RandomQueue from './queue/RandomQueue';

    import { urlBase, getRecommendedTrack, generateLayout } from '../scripts/utils';

    import contextMenu from 'vue-context-menu';

    import banner from './banner';
    import controlBar from './control-bar';
    import paneFrame from './pane-frame';
    import picturePane from './queue/picture-pane';
    import sourcePane from './source/source-pane';
    import searchPane from './source/search-pane';
    import listPane from './source/list-pane';
    import playlistPane from './queue/playlist-pane';
    import tracksPane from './queue/tracks-pane';
    import settings from './settings';
    import selectQueueModal from './select-queue-modal';

    export default {
        components: {
            contextMenu,
            banner,
            controlBar,
            paneFrame,
            picturePane,
            sourcePane,
            searchPane,
            listPane,
            playlistPane,
            tracksPane,
            settings,
            selectQueueModal
        },

        data() {
            return {
                showSettings: false,
                showSelectQueueModal: false,
                listContextMenuCallback: () => {},
                searchContextMenuCallback: () => {},
                selectQueueModalCallback: () => {},
                trackContextMenuCallback: () => {},
                playlistContextMenuCallback: () => {}
            }
        },

        computed: {
            track() {
                return this.queue ? this.queue.get(this.queue.active) : [];
            },

            pictureLayout: {
                get() {
                    return this.layout.picture;
                },
                set(layout) {
                    this[SAVE_LAYOUT]({
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
                    this[SAVE_LAYOUT]({
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
                    this[SAVE_LAYOUT]({
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
                    this[SAVE_LAYOUT]({
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
                    this[SAVE_LAYOUT]({
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
                    this[SAVE_LAYOUT]({
                        index: 'tracks',
                        layout
                    });
                }
            },

            pictureOpen: {
                get() {
                    return this.$store.state.generalModule.layout.picture.visible;
                },

                set(visible) {
                    const layout = this.layout.picture;

                    layout.visible = visible;

                    this[SAVE_LAYOUT]({
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

                    this[SAVE_LAYOUT]({
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

                    this[SAVE_LAYOUT]({
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

                    this[SAVE_LAYOUT]({
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

                    this[SAVE_LAYOUT]({
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

                    this[SAVE_LAYOUT]({
                        index: 'tracks',
                        layout
                    });
                }
            },

            queue() {
                return this.queueGroup.get(this.queueGroup.active);
            },

            ...mapState({
                panels: state => state.generalModule.panels,
                lockActivePanelIndex: state => state.generalModule.activePanel.lock,
                player: state => state.playerModule.playerController.player,
                queueGroup: state => state.queueModule.queueGroup,
                background: state => state.visualizationModule.background,
                visualizer: state => state.visualizationModule.visualizer,
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
                ADD_SOURCES,
                UPDATE_QUEUE_GROUP,
                INSERT_QUEUE,
                UPDATE_PLAYING_QUEUE_INDEX,
                ADD_TRACK,
                UPDATE_ACTIVE_PANEL_INDEX,
                SET_MODE,
                LOAD_LAYOUT,
                SAVE_LAYOUT,
                SWITCH_TO_BACKGROUND,
                BACKGROUND_LOAD_RESOURCE
            ]),
            ...mapActions([
                'initVisualization'
            ])
        },

        created() {
            if (!this.queueGroup.length) {
                this[INSERT_QUEUE]({
                    index: 0,
                    queue: new Queue({
                        name: this.$t('Temp')
                    })
                });

                this[INSERT_QUEUE]({
                    index: 0,
                    queue: new RandomQueue({
                        name: this.$t('Listen Randomly')
                    })
                });

                this[UPDATE_QUEUE_GROUP]({ active: 1 });
                this[UPDATE_PLAYING_QUEUE_INDEX](1);
            }

            const sourceActiveMap = JSON.parse(localStorage.getItem('kaiplayersourceactive')) || { hearthis: false };

            (async () => {
                const sources = (await (await fetch('/audio/sources', {
                    method: 'POST',
                    headers: new Headers({
                        'Content-Type': 'application/json'
                    })
                })).json()).data.map(source => {
                    const _source = new Source({
                        id: source.id,
                        name: source.name
                    });

                    source.channels.forEach(channel => {
                        _source.add(new Channel({
                            source: source.id,
                            type: channel.type,
                            name: channel.name
                        }));
                    });

                    if (sourceActiveMap.hasOwnProperty(source.id)) {
                        _source.active = sourceActiveMap[source.id];
                    } else {
                        _source.active = true;
                    }

                    return _source;
                });

                this[ADD_SOURCES](sources);

                if (this.queue.constructor === RandomQueue || !this.queue.length && this.queue.name === this.$t('Temp')) {
                    const track = await getRecommendedTrack(null, sources);

                    this[ADD_TRACK](track);
                    this[BACKGROUND_LOAD_RESOURCE]({ picture: track.picture });
                } else {
                    this[BACKGROUND_LOAD_RESOURCE]({ picture: this.track.picture });
                }
            })();
        },

        mounted() {
            this[SET_MODE](window.innerWidth < 600 ? 'mobile' : 'desktop');

            const layoutData = localStorage.getItem('kaiplayerlayout' + this.mode);

            if (layoutData) {
                this[LOAD_LAYOUT](JSON.parse(layoutData));
            } else {
                const viewportWidth = window.innerWidth,
                    viewportHeight = window.innerHeight - document.querySelector('#control-bar').offsetHeight;

                this[LOAD_LAYOUT](generateLayout(this.mode, viewportWidth, viewportHeight));
            }

            document.body.addEventListener('click', this.blur);

            this.initVisualization(this.$el);
            this.background.activeRenderer.start();
            this.background.start();
            this.background.activeRenderer.show();
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