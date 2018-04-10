<template lang="pug">
    .app
        control-bar
        template(v-if="layout")
            transition(name="fade")
                pane-frame(
                    v-if="pictureLayout.visible"
                    v-model="pictureLayout"
                    heading="Artwork"
                )
                    picturePane
            transition(name="fade")
                pane-frame(
                    v-if="sourceLayout.visible"
                    v-model="sourceLayout"
                    heading="Media Source"
                )
                    sourcePane
            transition(name="fade")
                pane-frame(
                    v-if="listLayout.visible"
                    v-model="listLayout"
                    heading="Chart"
                )
                    listPane
            transition(name="fade")
                pane-frame(
                    v-if="searchLayout.visible"
                    v-model="searchLayout"
                    heading="Search"
                )
                    searchPane
            transition(name="fade")
                pane-frame(
                    v-if="playlistLayout.visible"
                    v-model="playlistLayout"
                    heading="Playlist"
                )
                    playlistPane
            transition(name="fade")
                pane-frame(
                    v-if="tracksLayout.visible"
                    v-model="tracksLayout"
                    heading="Tracks"
                )
                    tracksPane
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';

    import config from '../config';

    import { ADD_SOURCES, INSERT_QUEUE, UPDATE_PLAYING_QUEUE_INDEX, ADD_TRACK, UPDATE_ACTIVE_PANEL_INDEX, SET_MODE, LOAD_LAYOUT, SAVE_LAYOUT, SWITCH_TO_BACKGROUND } from '../scripts/mutation-types';

    import Source from './source/Source';
    import Channel from './source/Channel';
    import Queue from './queue/Queue';
    import RandomQueue from './queue/RandomQueue';

    import { getRecommendedTrack, generateLayout } from '../scripts/utils';

    import controlBar from './control-bar';
    import paneFrame from './pane-frame';
    import picturePane from './queue/picture-pane';
    import sourcePane from './source/source-pane';
    import searchPane from './source/search-pane';
    import listPane from './source/list-pane';
    import playlistPane from './queue/playlist-pane';
    import tracksPane from './queue/tracks-pane';

    export default {
        components: {
            controlBar,
            paneFrame,
            picturePane,
            listPane,
            sourcePane,
            playlistPane,
            tracksPane,
            searchPane
        },
        computed: {
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
            ...mapState({
                lockActivePanelIndex: state => state.generalModule.activePanel.lock,
                player: state => state.playerModule.player,
                background: state => state.visualizationModule.background,
                visualizer: state => state.visualizationModule.visualizer,
                mode: state => state.generalModule.mode,
                layout: state => state.generalModule.layout
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
                INSERT_QUEUE,
                UPDATE_PLAYING_QUEUE_INDEX,
                ADD_TRACK,
                UPDATE_ACTIVE_PANEL_INDEX,
                SET_MODE,
                LOAD_LAYOUT,
                SAVE_LAYOUT,
                SWITCH_TO_BACKGROUND
            ]),
            ...mapActions([
                'initVisualization'
            ])
        },
        created() {
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

            this[UPDATE_PLAYING_QUEUE_INDEX](0);

            (async () => {
                const sources = (await (await fetch(config.urlBase + '/audio/sources', {
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

                    _source.active = true;

                    return _source;
                });

                this[ADD_SOURCES](sources);
                this[ADD_TRACK](await getRecommendedTrack(null, sources));
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

            this.player.on('end', () => {
                this.visualizer.stop();
                this[SWITCH_TO_BACKGROUND]();
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