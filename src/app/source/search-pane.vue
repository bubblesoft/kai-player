<template lang="pug">
    .wrap
        div.input-group
            input.form-control(
                v-model="keywords"
                @keyup.enter="search(keywords)"
                :placeholder="searchInputPlaceHolder"
                type="text"
            )
            span.input-group-btn
                button.btn.btn-default(
                    @click="search(keywords)"
                    type="button"
                ) Search
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
              keywords: '',
              tracks: [],
              searchInputPlaceHolder: ''
          }
        },
        computed: {
            ...mapState({
                sourceGroup: state => state.sourceModule.sourceGroup,
                queue: state => {
                    const queueGroup = state.queueModule.queueGroup;

                    return queueGroup.get(queueGroup.active);
                },
                player: state => state.playerModule.player,
                i18n: state => state.generalModule.i18n
            })
        },
        methods: {
            search(keywords) {
                this.sourceGroup.search(keywords)
                    .then(tracks => {
                        this.tracks = tracks;
                    });
            },
            addToPlayback(track) {
                const index = this.queue.add(track);

                this.queue.get(this.queue.goTo(index)).getSrc().then(url => {
                    this.player.load([url])
                            .then(() => this.player.play());
                });
            }
        },
        filters: {
            formatDuration
        },
        created() {
            this.searchInputPlaceHolder = this.i18n.t('Search for music');
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

            td {
                word-break: break-all;
            }
        }
    }
</style>