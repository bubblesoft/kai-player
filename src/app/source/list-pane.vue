<template lang="pug">
    .list-pane(v-if="sources.length")
        .toolbar
            select.form-control.input-sm(v-model="sourceSelected")
                option(
                    v-for="source in sources"
                    :value="source"
                ) {{ source.name }}
            select.form-control.input-sm(
                v-if="sourceSelected"
                v-model="channelSelected"
            )
                option(
                    v-for="channel in sourceSelected.get()"
                    :value="channel"
                ) {{ channel.name }}
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

    import { formatDuration } from '../../scripts/utils';

    import { UPDATE_PLAYING_QUEUE_INDEX, ADD_TRACK, SWITCH_TO_VISUALIZER, TRIGGER_BACKGROUND_EVENT, VISUALIZER_LISTEN_TO } from '../../scripts/mutation-types';

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
            sources() {
              return this.sourceGroup.get();
            },

            queue() {
                return this.queueGroup.get(this.queueGroup.active);
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

            ...mapState({
                sourceGroup: state => state.sourceModule.sourceGroup,
                queueGroup: state => state.queueModule.queueGroup,
                queue: state => state.queueModule.queueGroup.get(state.queueModule.queueGroup.active),
                playerController: state => state.playerModule.playerController
            })
        },
        methods: {
            async addToPlayback(track) {
                this[ADD_TRACK](track);

                const playing = this.player.playing;

                await this.playerController.playTrack(track);
                this.playingQueueIndex = this.queueGroup.active;
                console.log(track.picture);
                this[VISUALIZER_LISTEN_TO](this.player._sound._sounds[0]._node, track.picture);

                if (!playing) {
                    this[SWITCH_TO_VISUALIZER]();
                }

                track.duration = this.player.duration * 1000;
            },

            ...mapMutations([
                UPDATE_PLAYING_QUEUE_INDEX,
                ADD_TRACK,
                SWITCH_TO_VISUALIZER,
                TRIGGER_BACKGROUND_EVENT,
                VISUALIZER_LISTEN_TO
            ])
        },
        filters: {
            formatDuration
        },
        created() {
            (async () => {
                if (this.sources.length) {
                    this.sourceSelected = sources[0];
                    this.channelSelected = this.sourceSelected.get(0);
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
                this.channelSelected = this.sourceSelected.get(0);
            },
            sourceSelected(source) {
                this.channelSelected = source.get(0);
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

            tr {
                cursor: default;

                td {
                    word-break: break-all;
                }
            }
        }
    }
</style>