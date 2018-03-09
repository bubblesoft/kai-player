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

    import { UPDATE_PANEL, UPDATE_ACTIVE_PANEL_INDEX } from '../scripts/mutation-types';

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
                lockActivePanelIndex: state => state.generalModule.activePanel.lock
            })
        },
        methods: {
            ...mapMutations([
                UPDATE_PANEL,
                UPDATE_ACTIVE_PANEL_INDEX
            ])
        },
        created() {
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
            this.interactable = interact(document.body)
                .on('tap', e => {
                    if (!this.lockActivePanelIndex) {
                        this[UPDATE_ACTIVE_PANEL_INDEX](null);
                    }

                    e.preventDefault();
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