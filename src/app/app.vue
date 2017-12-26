<template lang="pug">
    .app()
        control-bar
        transition(name="fade")
            pane-frame(
                v-if="panels.source.open"
                type="source"
            )
        transition(name="fade")
            pane-frame(
                v-if="panels.list.open"
                type="list"
            )
        transition(name="fade")
            pane-frame(
                v-if="panels.playlist.open"
                type="playlist"
            )
        transition(name="fade")
            pane-frame(
                v-if="panels.tracks.open"
                type="tracks"
            )
        transition(name="fade")
            pane-frame(
                v-if="panels.search.open"
                type="search"
            )
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    import interact from 'interactjs';

    import config from '../config';

    import { ADD_SOURCES, INSERT_QUEUE, UPDATE_PLAYING_QUEUE_INDEX, ADD_TRACK, UPDATE_PANEL, UPDATE_ACTIVE_PANEL_INDEX } from '../scripts/mutation-types';

    import Source from './source/Source';
    import Channel from './source/Channel';
    import Queue from './queue/Queue';
    import RandomQueue from './queue/RandomQueue';

    import { getRecommendedTrack } from '../scripts/utils';

    import controlBar from './control-bar';
    import paneFrame from './pane-frame';

    export default {
        components: {
            controlBar,
            paneFrame
        },
        data() {
            return {
                interactable: null
            }
        },
        computed: {
            ...mapState({
                panels: state => state.generalModule.panels,
                lockActivePanelIndex: state => state.generalModule.activePanel.lock,
                player: state => state.playerModule.player,
                visualizer: state => state.visualizationModule.visualizer
            })
        },
        methods: {
            ...mapMutations([
                ADD_SOURCES,
                INSERT_QUEUE,
                UPDATE_PLAYING_QUEUE_INDEX,
                ADD_TRACK,
                UPDATE_PANEL,
                UPDATE_ACTIVE_PANEL_INDEX
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
                        }))
                    });

                    _source.active = true;

                    return _source;
                });

                this[ADD_SOURCES](sources);
                this[ADD_TRACK](await getRecommendedTrack(null, sources));
            })();

            if (window.innerWidth < 600) {
                this[UPDATE_PANEL]({
                    index: 'source',
                    open: false
                });

                this[UPDATE_PANEL]({
                    index: 'search',
                    open: false
                });
            }
        },
        mounted() {
            this.visualizer.mount(this.$el);
            this.visualizer.init();

            this.interactable = interact(document.body)
                .on('tap', e => {
                    if (!this.lockActivePanelIndex) {
                        this[UPDATE_ACTIVE_PANEL_INDEX](null);
                    }

                    e.preventDefault();
                });

            this.player.on('end', () => {
                this.visualizer.stop();
            });
        },
        destroyed() {
            if (this.interactable) {
                this.interactable.unset();
            }
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
    }


    /*Panel transition*/

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