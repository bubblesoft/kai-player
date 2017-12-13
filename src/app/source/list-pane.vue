<template lang="pug">
    .wrap
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
                    td {{ track.length | formatDuration('mm:ss') }}
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
            sources() {
                return this.sourceGroup.get()
            },
            channels() {
                return this.sourceSelected.get()
            },
            ...mapState({
                sourceGroup: state => state.sourceModule.sourceGroup,
                queueGroup: state => state.queueModule.queueGroup,
                queue: state => {
                    const queueGroup = state.queueModule.queueGroup;

                    return queueGroup.get(queueGroup.active);
                },
                player: state => state.playerModule.player
            })
        },
        methods: {
            addToPlayback(track) {
                const queueGroup = this.queueGroup;

                queueGroup
                    .get(queueGroup.active)
                    .add(track);

                this.queue.get(this.queue.active).getSrc().then(url => {
                    this.player.load([url])
                        .then(() => this.player.play());
                });
            }
        },
        filters: {
            formatDuration
        },
        created() {
            this.sourceSelected = this.sources[0];
            this.channelSelected = this.channels[0];

            this.channelSelected.get();
        },
        watch: {
            channelSelected(channel) {
                channel
                    .get()
                    .then(tracks => {
                        this.tracks = tracks;
                    });
            }
        }
    }
</script>

<style lang="scss" scoped>
    .wrap {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        width: auto;
        height: auto;
        background-color: rgba(255, 255, 255, .15);
        overflow: auto;

        tr {
            cursor: default;
        }
    }
</style>