<template lang="pug">
    .wrap
        table.table-condensed.table.table-hover
            tbody
                tr(
                    v-for="track in tracks"
                    @dblclick="playTrack(track)"
                )
                    td {{ track.title }}
                    td {{ track.length }}
</template>

<script>
    import { mapState } from 'vuex';

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
            ...mapState({
                queueGroup: state => state.queueModule.queueGroup,
                player: state => state.playerModule.player
            })
        },
        methods: {
            playTrack(track) {
                this.player.load(track.src);
                this.player.play();
            }
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
        }
    }
</style>