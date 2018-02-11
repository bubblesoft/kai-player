<template lang="pug">
    .wrap
        table.table-condensed.table.table-hover
            tbody
                tr(
                    v-for="(track, index) in tracks"
                    @dblclick="playTrack(index)"
                )
                    td(style="width:18px")
                        template(v-if="index === activeIndex")
                            svg(
                                v-if="playing"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                            )
                                path(d="M8 5v14l11-7z")
                            svg(
                                v-else
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                            )
                                path(d="M6 19h4V5H6v14zm8-14v14h4V5h-4z")
                    td {{ track.name }}
                    td {{ track.artists.map(artist => artist.name).join(', ') }}
                    td {{ track.duration | formatDuration('mm:ss') }}
</template>

<script>
    import { mapState } from 'vuex';

    import { formatDuration } from '../../scripts/utils';

    export default {
        data() {
          return {
              queue: null
          }
        },
        computed: {
            tracks() {
              return this.queue.get();
            },
            activeIndex() {
                return this.queue.active;
            },
            playing() {
                return this.player.playing
            },
            ...mapState({
                queueGroup: state => state.queueModule.queueGroup,
                player: state => state.playerModule.player
            })
        },
        methods: {
            async playTrack(index) {
                const url = await this.queue.get(this.queue.goTo(index)).getStreamUrl();

                await this.player.load(url);
                this.player.play();
            }
        },
        filters: {
            formatDuration
        },
        created() {
            this.queue = this.queueGroup.get(this.queueGroup.active);
        }
    }
</script>

<style lang="scss" scoped>
    .wrap {
        height: 100%;
        background-color: rgba(255, 255, 255, .15);

        tr {
            cursor: default;

            svg {
                width: 18px;
                height: 18px;
                fill: #fff;
            }
        }
    }
</style>