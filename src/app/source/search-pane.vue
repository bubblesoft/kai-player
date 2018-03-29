<template lang="pug">
    .search-pane
        .tool-bar
            .input-group.input-group-sm
                input.form-control(
                    v-model="keywords"
                    @keyup.enter="search(keywords)"
                    :placeholder="searchInputPlaceHolder"
                    type="text"
                )
                span.input-group-btn
                    button.btn.btn-default(
                        v-interact:tap="() => { search(keywords); }"
                        type="button"
                    ) Search
        .list-wrap
            table.table-condensed.table.table-hover
                draggable(
                    v-model="tracks"
                    :options="{ group: { name: 'tracks', pull: 'clone', put: false }, sort: false, handle: 'tr.active', forceFallback: true, fallbackOnBody: true }"
                    element="tbody"
                )
                    tr(
                        v-for="track in tracks"
                        v-interact:doubletap="() => { addToPlayback(track); }"
                    )
                        td(style="padding: 0;")
                        td {{ track.name }}
                        td {{ track.artists.map(artist => artist.name).join(', ') }}
                        td(
                            v-if="track.duration"
                            style="width:46px"
                        ) {{ track.duration | formatDuration('mm:ss') }}
                        td(v-else)
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    import config from '../../config';

    import { formatDuration } from '../../scripts/utils';

    import { UPDATE_PLAYING_QUEUE_INDEX, ADD_TRACK } from '../../scripts/mutation-types';

    import Track from '../Track';
    import Artist from '../Artist';

    import draggable from 'vuedraggable';

    export default {
        components: {
            draggable
        },
        data() {
          return {
              keywords: '',
              tracks: [],
              searchButtonText: '',
              searchInputPlaceHolder: ''
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

                this.tracks = (await (await fetch(config.urlBase + '/audio/search', {
                    method: 'POST',
                    body: JSON.stringify({
                        keywords,
                        sources: activeSources
                    }),
                    headers: new Headers({
                        'Content-Type': 'application/json'
                    })
                })).json()).data.map(trackData => {
                    return new Track({
                        id: trackData.source + '_' + trackData.id,
                        name: trackData.name,
                        duration: trackData.duration || null,
                        artists: trackData.artists.map(artist => new Artist({ name: artist.name }))
                    });
                });
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
            ...mapMutations([
                    UPDATE_PLAYING_QUEUE_INDEX,
                    ADD_TRACK
            ])
        },
        filters: {
            formatDuration
        },
        created() {
            this.searchButtonText = this.$t('Search');
            this.searchInputPlaceHolder = this.$t('Search for music');
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

            tr {
                cursor: default;

                td {
                    word-break: break-word;
                }
            }
        }
    }
</style>