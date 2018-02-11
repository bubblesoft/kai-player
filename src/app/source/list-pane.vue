<template lang="pug">
    .list-pane(v-if="sources.length")
        select.form-control(v-model="sourceSelected")
            option(
                v-for="source in sources"
                :value="source"
            ) {{ source.name }}
        select.form-control(v-model="channelSelected")
            option(
                v-for="channel in sourceSelected.get()"
                :value="channel"
            ) {{ channel.name }}
        table.table-condensed.table.table-hover
            tbody
                tr(
                    v-for="track in tracks"
                    @dblclick="addToPlayback(track)"
                )
                    td {{ track.name }}
                    td {{ track.artists.map(artist => artist.name).join(', ') }}
                    td(style="width:46px") {{ track.duration | formatDuration('mm:ss') }}
</template>

<script>
    import { mapState } from 'vuex';

    import { formatDuration } from '../../scripts/utils';

    export default {
        data() {
          return {
              sourceSelected: null,
              channelSelected: null,
              tracks: []
          }
        },
        computed: {
            ...mapState({
                sources: state => state.sourceModule.sources,
                sourceGroup: state => state.sourceModule.sourceGroup,
                queue: state => {
                    const queueGroup = state.queueModule.queueGroup;

                    return queueGroup.get(queueGroup.active);
                },
                player: state => state.playerModule.player
            })
        },
        methods: {
            async addToPlayback(track) {
                const index = this.queue.add(track),
                    url = await this.queue.get(this.queue.goTo(index)).getStreamUrl();

                this.player.load([url])
                    .then(() => this.player.play())
                    .catch(err => {
                        console.log(err);
                    });
            }
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

        tr {
            cursor: default;

            td {
                word-break: break-all;
            }
        }
    }
</style>