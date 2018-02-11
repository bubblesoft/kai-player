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
                    td(
                        v-if="track.duration"
                        style="width:46px"
                    ) {{ track.duration | formatDuration('mm:ss') }}
                    td(v-else)
</template>

<script>
    import { mapState } from 'vuex';

    import Track from '../Track';
    import Artist from '../Artist';

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
                sources: state => state.sourceModule.sources,
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
            async search(keywords) {
                const activeSources = this.sources.filter(source => source.active)
                    .map(source => source.id);

                this.tracks = (await this.sourceGroup.search(keywords, activeSources));
            },
            async addToPlayback(track) {
                const index = this.queue.add(new Track({
                    id: track.source + '_' + track.id,
                    name: track.name,
                    duration: track.duration || null,
                    artists: (() => {
                        const artists = [];

                        track.artists.forEach(artist => {
                            artists.push(new Artist({
                                name: artist.name
                            }));
                        });

                        return artists;
                    })()
                }));

                const url = await this.queue.get(this.queue.goTo(index)).getStreamUrl();

                await this.player.load([url]);
                this.player.play();
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