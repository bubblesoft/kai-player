<template lang="pug">
    .tracks-pane
        .toolbar
            template(v-if="queue.constructor === RandomQueue")
            template(v-else)
                tooltip(
                    effect="fadein"
                    placement="top"
                    :content="$t('Drag a track here to remove it')"
                )
                    draggable.tool-button(
                        v-model="trashCan.data"
                        :options="{ group: 'tracks', draggable: '' }"
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
                tooltip(
                    effect="fadein"
                    placement="top"
                    :content="editMode ? $t('Exit edit mode') : $t('Enter edit mode')"
                )
                    .tool-button(v-interact:tap="() => { editMode = !editMode; }")
                        svg(
                            v-if="editMode"
                            width="24"
                            height="24"
                            viewBox="-2 -2 28 28"
                        )
                            path(d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z")
                        svg(
                            v-else
                            width="24"
                            height="24"
                            viewBox="-2 -2 28 28"
                        )
                            path(d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z")
        .list-wrap
            .random-queue-box(v-if="queue.constructor === RandomQueue")
                yoyoMarquee(
                    v-if="activeTrack"
                    style="width: 90%;"
                    :title="activeTrack.name + '-' + (activeTrack.artists && activeTrack.artists.map(artist => artist.name).join(', ') || $t('Unknown Artist'))"
                )
                    h5(v-if="playingQueueIndex === queueGroup.active && activeTrack") {{ activeTrack.name + ' - ' + (activeTrack.artists && activeTrack.artists.map(artist => artist.name).join(', ') || $t('Unknown Artist')) }}
                .tips.text-muted {{ $t('Drag a track here and start random listening') }}
            table.table-condensed.table.table-hover(v-else)
                draggable(
                    v-model="tracks"
                    :options="{ group: 'tracks', handle: '.drag-handle', forceFallback: true, fallbackOnBody: true }"
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
                        td(style="width: 18px;")
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
                        td(style="padding: 0;")
                            editableBox(
                                v-model="track.name"
                                :editable="editMode"
                                :height="30"
                            )
                        td {{ track.artists.map(artist => artist.name).join(', ') }}
                        td(
                            v-if="track.duration"
                            style="width:46px"
                        ) {{ track.duration | formatDuration('mm:ss') }}
                        td(v-else)
                        td.drag-handle(v-if="editMode")
                            svg(
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                            )
                                path(d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z")

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
    import tooltip from 'vue-strap/src/tooltip';

    import yoyoMarquee from '../yoyo-marquee';
    import editableBox from '../editable-box';

    export default {
        components: {
            draggable,
            tooltip,
            yoyoMarquee,
            editableBox
        },

        data() {
          return {
              selectedIndex: null,
              editMode: false,
              trashCan: {
                  hover: false,
                  data: []
              },
              dragging: false,
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

            player() {
                return this.playerController.player;
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

            activeTrack() {
                return this.queue.get(this.activeIndex);
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
                playerController: state => state.playerModule.playerController,
                visualizer: state => state.visualizationModule.visualizer
            })
        },

        watch: {
//            queue(to) {
//                this.playTrack(to.active);
//            }
        },

        methods: {
            async playTrack(index) {
                const track = await this.queue.get(this.queue.goTo(index));

                await this.playerController.playTrack(track);
                this.playingQueueIndex = this.queueGroup.active;
                this.visualizer.listen(this.player._sound._sounds[0]._node);
                this.visualizer.start();
                this.tracks[index].duration = this.player.duration * 1000;
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
        }
    }
</script>

<style lang="scss" scoped>
    .tracks-pane {
        height: 100%;

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

                .drag-handle {
                    width: 28px;
                    text-align: center;
                    vertical-align: middle;
                    cursor: move;
                    cursor: -webkit-grab;
                }
            }
        }
    }
</style>