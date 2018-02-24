<template lang="pug">
    .list-pane(v-if="sources.length")
        .toolbar
            select.form-control.input-sm(v-model="sourceSelected")
                option(
                    v-for="source in sources"
                    :value="source"
                ) {{ source.name }}
            select.form-control.input-sm(v-model="channelSelected")
                option(
                    v-for="channel in sourceSelected.get()"
                    :value="channel"
                ) {{ channel.name }}
        .list-wrap
            table.table-condensed.table.table-hover
                draggable(
                    v-model="tracks"
                    :options="{ group: { name: 'tracks', pull: 'clone', put: false }, sort: false, handle: '.active', forceFallback: true, fallbackOnBody: true }"
                    element="tbody"
                )
                    tr(
                        v-for="track in tracks"
                        v-hammer:doubletap="() => { addToPlayback(track); }"
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

    import { formatDuration } from '../../scripts/utils';

    import { UPDATE_PLAYING_QUEUE_INDEX } from '../../scripts/mutation-types';

    import draggable from 'vuedraggable';

    export default {
        components: {
            draggable
        },
        data() {
          return {
              sourceSelected: null,
              channelSelected: null,
              tracks: []
          }
        },
        computed: {
            playingQueueIndex: {
                get() {
                    return this.$store.state.queueModule.playingQueueIndex;
                },
                set(index) {
                    this[UPDATE_PLAYING_QUEUE_INDEX]({ index });
                }
            },
            ...mapState({
                sourceGroup: state => state.sourceModule.sourceGroup,
                sources: state => state.sourceModule.sources,
                queueGroup: state => state.queueModule.queueGroup,
                queue: state => state.queueModule.queueGroup.get(state.queueModule.queueGroup.active),
                player: state => state.playerModule.player
            })
        },
        methods: {
            test(){
                console.log('test');
            },
            async addToPlayback(track) {
                this.queue.active = this.queue.add(track);

                const url = await track.getStreamUrl();

                await this.player.load([url]);
                this.player.play();
                track.duration = this.player.duration * 1000;
                this.playingQueueIndex = this.queueGroup.active;
            },
            ...mapMutations([UPDATE_PLAYING_QUEUE_INDEX])
        },
        filters: {
            formatDuration
        },
        created() {
            (async () => {
                if (this.sources.length) {
                    this.sourceSelected = this.sources[0];
                    this.channelSelected = this.sourceSelected.get()[0];
                }
            })();
        },
        watch: {
            channelSelected(channel) {
                channel
                    .get()
                    .then(tracks => {
                        this.tracks = tracks;
                    });
            },
            sources(sources) {
                this.sourceSelected = sources[0];
                this.channelSelected = this.sourceSelected.get()[0];
            }
        }
    }
</script>

<style lang="scss" scoped>
    .list-pane {
        height: 100%;
        background-color: rgba(255, 255, 255, .15);
        overflow: auto;

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

            tr {
                cursor: default;

                td {
                    word-break: break-all;
                }
            }
        }
    }
</style>