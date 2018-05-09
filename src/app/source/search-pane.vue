<template lang="pug">
    .search-pane
        .tool-bar
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
            :class="{ blur: loading }"
        )
            table.table-condensed.table.table-hover
                draggable(
                    v-model="tracks"
                    :options="{ group: { name: 'tracks', pull: 'clone', put: false }, sort: false, handle: '.drag-handle', forceFallback: true, fallbackOnBody: true }"
                    element="tbody"
                )
                    tr(
                        v-for="track in tracks"
                        v-interact:doubletap="() => { addToPlayback(track); }"
                        @contextmenu.prevent="handleContextMenu(track);"
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
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    import config from '../../config';

    import { formatDuration } from '../../scripts/utils';

    import { UPDATE_PLAYING_QUEUE_INDEX, ADD_TRACK } from '../../scripts/mutation-types';

    import Track from '../Track';
    import Artist from '../Artist';

    import draggable from 'vuedraggable';
    import vueLoading from 'vue-loading-template';

    let controller = new AbortController;

    export default {
        components: {
            draggable,
            vueLoading
        },
        data() {
          return {
              keywords: '',
              tracks: [],
              loading: false
          }
        },
        computed: {
            sources() {
                return this.sourceGroup.get();
            },
            playingQueueIndex: {
                get() {
                    return this.$store.state.queueModule.playingQueueIndex;
                },
                set(index) {
                    this[UPDATE_PLAYING_QUEUE_INDEX](index);
                }
            },
            ...mapState({
                sourceGroup: state => state.sourceModule.sourceGroup,
                queueGroup: state => state.queueModule.queueGroup,
                queue: state => state.queueModule.queueGroup.get(state.queueModule.queueGroup.active),
                player: state => state.playerModule.player,
                i18next: state => state.generalModule.i18next
            })
        },
        methods: {
            async search(keywords) {
                const activeSources = this.sources.filter(source => source.active)
                    .map(source => source.id);

                this.loading = true;

                try {
                    controller.abort();
                    controller = new AbortController;

                    this.tracks = (await (await fetch(config.urlBase + '/audio/search', {
                        method: 'POST',
                        body: JSON.stringify({
                            keywords,
                            sources: activeSources
                        }),
                        headers: new Headers({
                            'Content-Type': 'application/json'
                        }),
                        signal: controller.signal
                    })).json()).data.map(trackData => {
                        return new Track({
                            id: trackData.source + '_' + trackData.id,
                            name: trackData.name,
                            duration: trackData.duration || null,
                            artists: trackData.artists.map(artist => new Artist({ name: artist.name })),
                            picture: trackData.picture
                        });
                    });
                } catch (e) {
                    console.log(e);
                }

                this.$refs.list.scrollTop = 0;
                this.loading = false;
            },

            async addToPlayback(track) {
                this[ADD_TRACK](track);

                const url = await track.getStreamUrl();

                await this.player.load([url]);
                this.player.play();
                this.playingQueueIndex = this.queueGroup.active;
                this.visualizer.listen(this.player._sound._sounds[0]._node);
                this.visualizer.start();
                track.duration = this.player.duration * 1000;
            },

            handleContextMenu(track) {
                this.$emit('contextMenu', type => {
                    if (type === 'add') {
                        this.addToPlayback(track);
                    }
                });
            },

            ...mapMutations([
                    UPDATE_PLAYING_QUEUE_INDEX,
                    ADD_TRACK
            ])
        },
        filters: {
            formatDuration
        }
    }
</script>

<style lang="scss" scoped>
    .search-pane {
        height: 100%;

        .tool-bar {
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

            tr {
                cursor: default;

                td {
                    word-break: break-word;

                    &.drag-handle {
                         width: 28px;
                         text-align: center;
                         vertical-align: middle;
                         cursor: move;
                         cursor: -webkit-grab;

                        svg {
                            width: 18px;
                            height: 18px;
                            fill: #fff;
                        }
                    }
                }
            }
        }

        .vue-loading {
            position: absolute;
            left: 0;
            top: 36px;
            right: 0;
            bottom: 0;
        }
    }

    .sortable-drag {
        color: #fff;

        td {
            padding: 0 2px;

            svg {
                vertical-align: middle;
                width: 18px;
                height: 18px;
                fill: #fff;
            }
        }
    }
</style>