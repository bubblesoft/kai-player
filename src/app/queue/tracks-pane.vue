<template lang="pug">
    .tracks-pane
        .toolbar
            template(v-if="queue.constructor === RandomQueue")
            template(v-else)
                draggable.tool-button(
                    v-model="trashCan.data"
                    :options="{ group: 'tracks' }"
                    @dragover.native="trashCan.hover = true"
                    @dragleave.native="trashCan.hover = false"
                    :class="{ active: dragging && trashCan.hover }"
                )
                    svg(
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                    )
                        path(d="M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12z")
        .list-wrap
            .random-queue-box(v-if="queue.constructor === RandomQueue")
                h5(v-if="playingQueueIndex === queueGroup.active && tracks[activeIndex]") {{ tracks[activeIndex].name + ' - ' + tracks[activeIndex].artists.map(artist => artist.name).join(', ') }}
                .tips.text-muted {{ tips[0] }}
            table.table-condensed.table.table-hover(v-else)
                draggable(
                    v-model="tracks"
                    :options="{ group: 'tracks', handle: 'tr.active', forceFallback: true, fallbackOnBody: true }"
                    @sort="onSort"
                    @start="dragging = true"
                    @end="dragging = false"
                    element="tbody"
                )
                    tr(
                        v-for="(track, index) in tracks"
                        v-interact:doubletap="() => { playTrack(index); }"
                        v-interact:tap="() => { select(index); }"
                    )
                        td(style="width:18px")
                            template(v-if="queueGroup.active === playingQueueIndex && index === activeIndex")
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
                        td(
                            v-if="track.duration"
                            style="width:46px"
                        ) {{ track.duration | formatDuration('mm:ss') }}
                        td(v-else)
                    tr(
                        slot="footer"
                        v-if="!tracks.length"
                        style="display: block; height: 80px; opacity: 0;"
                    )
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    import { formatDuration } from '../../scripts/utils';

    import RandomQueue from './RandomQueue';

    import { UPDATE_QUEUE, UPDATE_PLAYING_QUEUE_INDEX } from '../../scripts/mutation-types';

    import draggable from 'vuedraggable';

    import editableBox from '../editable-box';

    export default {
        components: {
            draggable,
            editableBox
        },
        data() {
          return {
              selectedIndex: null,
              trashCan: {
                  hover: false,
                  data: []
              },
              dragging: false,
              tips: [],
              RandomQueue
          }
        },
        computed: {
            queue() {
                return this.queueGroup.get(this.queueGroup.active);
            },
            tracks: {
                get() {
                    return this.queue ? this.queue.get() : [];
                },
                set(tracks) {
                    this[UPDATE_QUEUE]({
                        index: this.queueGroup.active,
                        tracks
                    });
                }
            },
            activeIndex: {
                get() {
                    return this.queue.active;
                },
                set(active) {
                    this[UPDATE_QUEUE]({
                        index: this.queueGroup.active,
                        active
                    });
                }
            },
            playing() {
                return this.player.playing
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
                queueGroup: state => state.queueModule.queueGroup,
                player: state => state.playerModule.player,
                i18next: state => state.generalModule.i18next
            })
        },
        watch: {
//            queue(to) {
//                this.playTrack(to.active);
//            }
        },
        methods: {
            async playTrack(index) {
                const url = await this.queue.get(this.queue.goTo(index)).getStreamUrl();

                await this.player.load(url);
                this.player.play();
                this.tracks[index].duration = this.player.duration * 1000;
                this.playingQueueIndex = this.queueGroup.active;
            },
            select(index) {
                const select = () => {
                    document.removeEventListener('click', select);
                    this.selectedIndex = index;
                };

                document.addEventListener('click', select);
            },
            onSort(e) {
                if (this.activeIndex !== null) {
                    if (e.from === e.to) {
                        if (e.oldIndex === this.activeIndex) {
                            this.activeIndex = e.newIndex;
                        } else if (e.oldIndex > this.activeIndex && e.newIndex <= this.activeIndex) {
                            this.activeIndex++;
                        } else if (e.oldIndex < this.activeIndex && e.newIndex >= this.activeIndex) {
                            this.activeIndex--;
                        }
                    } else if (e.from !== e.to) {
                        if (e.oldIndex === this.activeIndex) {
                            this.player.unload();
                            this.activeIndex = null;
                        } else if (e.oldIndex < this.activeIndex) {
                            this.activeIndex--;
                        }
                    }
                }
            },
            ...mapMutations([
                UPDATE_QUEUE,
                UPDATE_PLAYING_QUEUE_INDEX
            ])
        },
        filters: {
            formatDuration
        },
        created() {
            this.tips[0] = this.i18next.t('Drag a track here and start random listening');
        }
    }
</script>

<style lang="scss" scoped>
    .tracks-pane {
        height: 100%;
        background-color: rgba(255, 255, 255, .15);

        .toolbar {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding: 0 5px;
            box-shadow: inset 0 -2px 1px -1.5px rgba(0, 0, 0, 0.2);

            .tool-button {
                margin: 0 2px;
                cursor: pointer;

                svg {
                    fill: rgba(255, 255, 255, 0.6);
                }

                &:hover svg {
                    fill: rgba(255, 255, 255, 0.9);
                    -webkit-filter: drop-shadow(2px 2px 10px rgba(150, 150, 150, 1));
                    filter: drop-shadow(2px 2px 10px rgba(150, 150, 150, 1));
                    -ms-filter: "progid:DXImageTransform.Microsoft.Dropshadow(OffX=2, OffY=2, Color='rgba(150, 150, 150, 1)')";
                    filter: "progid:DXImageTransform.Microsoft.Dropshadow(OffX=2, OffY=2, Color='rgba(150, 150, 150, 1)')";
                }

                &.active svg {
                    fill: rgba(211, 101, 98, .9);
                }

                tr {
                    display: none;
                }
            }
        }

        .list-wrap {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: calc(100% - 30px);
            margin-top: 29px;
            box-shadow: inset 0 2px 1px -1.5px rgba(255, 255, 255, 0.2);
            overflow: auto;

            .random-queue-box {
                display: flex;
                justify-content: center;
                align-items: center;
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;

                .tips {
                    position: absolute;
                    left: 0;
                    bottom: 12%;
                    width: 100%;
                    text-align: center;
                    font-style: italic;
                }
            }

            tr {
                cursor: default;

                svg {
                    width: 18px;
                    height: 18px;
                    fill: #fff;
                }

                &.queue-active {
                    background-color: rgba(0, 0, 0, .3);
                }
            }
        }
    }
</style>