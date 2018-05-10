<template lang="pug">
    .tracks-pane
        .toolbar
            template(v-if="queue")
                template(v-if="queue.constructor === RandomQueue")
                    tooltip(
                        effect="fadein"
                        placement="top"
                        :content="$t('Add to a playlist')"
                    )
                        .tool-button(@click="copyToQueue(activeTrack)")
                            svg(
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                            )
                                path(d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5a2 2 0 0 0-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z")
                template(v-else)
                    tooltip(
                        effect="fadein"
                        placement="top"
                        :content="$t('Remove duplicated tracks')"
                    )
                        .tool-button(v-interact:tap="() => { removeDuplicated(); }")
                            svg(
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                            )
                                path(d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z")
                    tooltip(
                        v-if="editMode"
                        effect="fadein"
                        placement="top"
                        :content="$t('Drag a track here to remove it')"
                    )
                        draggable.tool-button(
                            v-model="trashCan.data"
                            :options="{ group: 'tracks', draggable: '' }"
                            @pointerover.native="trashCan.hover = true"
                            @pointerleave.native="trashCan.hover = false"
                            :class="{ active: dragging && trashCan.hover }"
                        )
                            svg(
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                            )
                                path(d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z")
                    tooltip(
                        effect="fadein"
                        placement="top"
                        :content="editMode ? $t('Exit edit mode') : $t('Enter edit mode')"
                    )
                        .tool-button(v-interact:tap="() => { editMode = !editMode; }")
                            svg(
                                v-if="editMode"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                            )
                                path(d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z")
                            svg(
                                v-else
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                            )
                                path(d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z")
        .list-wrap(v-if="queue")
            draggable.random-queue-box(
                v-if="queue.constructor === RandomQueue"
                v-model="tracks"
                :options="{ group: 'tracks', draggable: '' }"
                @add="handleAdd"
            )
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
                    @sort="handleSort"
                    @start="dragging = true"
                    @end="dragging = false"
                    element="tbody"
                )
                    tr(
                        v-for="(track, index) in tracks"
                        v-interact:doubletap="() => { playTrack(index); }"
                        v-interact:tap="() => { select(index); }"
                        @contextmenu.prevent="handleContextMenu(track, index);"
                        :class="{ active: selectedIndex === index }"
                        ref="tracks"
                    )
                        td.drag-handle(v-if="editMode")
                            svg(
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                            )
                                path(d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z")
                        td(style="width: 18px;")
                            template(v-if="queueGroup.active === playingQueueIndex && index === activeIndex")
                                svg(
                                    v-if="playing"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                )
                                    path(d="M8 5v14l11-7z")
                                svg(
                                    v-else
                                    width="20"
                                    height="20"
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
                        td(v-if="showSourceIcon")
                            img(
                                :src="mapMediaSourceIcon(track.id.split('_')[0])"
                                :alt="mapMediaSourceName(track.id.split('_')[0])"
                                :title="mapMediaSourceName(track.id.split('_')[0])"
                            )

                    tr(
                        slot="footer"
                        v-if="tracks.length < 2"
                        style="display: block; height: 80px; opacity: 0;"
                    )
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    import { formatDuration, mapMediaSourceIcon, mapMediaSourceName } from '../../scripts/utils';

    import RandomQueue from './RandomQueue';

    import { UPDATE_QUEUE, UPDATE_PLAYING_QUEUE_INDEX, ADD_TRACK, UPDATE_TRACK } from '../../scripts/mutation-types';

    import draggable from 'vuedraggable';
    import tooltip from 'vue-strap/src/tooltip';
    import modal from 'vue-strap/src/modal';

    import yoyoMarquee from '../yoyo-marquee';
    import editableBox from '../editable-box';

    export default {
        components: {
            draggable,
            tooltip,
            modal,
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
          };
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
                    return this.queue ? this.queue.active : null;
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
                visualizer: state => state.visualizationModule.visualizer,
                showSourceIcon: state => state.generalModule.showSourceIcon
            })
        },

        watch: {
            activeIndex(to) {
                if (!this.$refs.tracks) {
                    return;
                }

                const trackDomEl = this.$refs.tracks[to];

                if (trackDomEl) {
                    trackDomEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }
        },

        methods: {
            async playTrack(index) {
                const track = await this.queue.get(this.queue.goTo(index));

                await this.playerController.playTrack(track);
                this.playingQueueIndex = this.queueGroup.active;
                this[VISUALIZER_LISTEN_TO]((this.player._sound._sounds[0]._node));

                if (!playing) {
                    this[SWITCH_TO_VISUALIZER]();
                }

                this[UPDATE_TRACK]({ index, duration: this.player.duration * 1000 });
            },

            async removeDuplicated() {
                try {
                    await this.$confirm({
                        title: this.$t('Confirm'),
                        bodyText: this.$t('Remove duplicated tracks?'),
                        confirmText: this.$t('Confirm'),
                        cancelText: this.$t('Cancel')
                    });

                    const checkSame = (track1, track2) => {
                        if (track1.name.replace(/\s/g, '') !== track2.name.replace(/\s/g, '')) {
                            return false;
                        }

                        const track1UniqueArtists = track1.artists.filter(artist => {
                            return !(track2.artists.find(anotherArtist => {
                                return artist.name.replace(/\s/g, '') === anotherArtist.name.replace(/\s/g, '');
                            }) + 1);
                        });

                        const track2UniqueArtists = track1.artists.filter(artist => {
                            return !(track1.artists.find(anotherArtist => {
                                return artist.name.replace(/\s/g, '') === anotherArtist.name.replace(/\s/g, '');
                            }) + 1);
                        });

                        return !track1UniqueArtists.length && !track2UniqueArtists.length;
                    };

                    this.tracks = this.tracks.filter((track, index) => {
                        return !this.tracks.find((anotherTrack, anotherIndex) => {
                            // Avoid comparing a track with itself or compare two same tracks multiple times
                            if (index >= anotherIndex) {
                                return false;
                            }

                            return checkSame(track, anotherTrack);
                        });
                    });
                } catch (e) { }
            },

            select(index) {
                const select = () => {
                    document.removeEventListener('click', select);
                    this.selectedIndex = index;
                };

                document.addEventListener('click', select);
            },

            handleSort(e) {
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
                            e.oldIndex > 0 && this.activeIndex--;
                        } else if (e.oldIndex < this.activeIndex) {
                            this.activeIndex--;
                        }
                    }
                }
            },

            handleAdd(e) {
                this.playTrack(e.newIndex);
            },

            copyToQueue(track) {
                this.$emit('openQueueModal', (queue) => {
                    this[ADD_TRACK]({ track, queue });
                });
            },

            handleContextMenu(track, index) {
                this.$emit('contextMenu', type => {
                    if (type === 'play') {
                        this.playTrack(index);
                    } else if (type === 'move') {
                        this.$emit('openQueueModal', (queue) => {
                            this[ADD_TRACK]({ track, queue });
                            this.tracks = this.tracks.slice(0, index).concat(this.tracks.slice(index + 1));
                            trashCan.data.push(track);
                        });
                    } else if (type === 'remove') {
                        this.tracks = this.tracks.slice(0, index).concat(this.tracks.slice(index + 1));
                        trashCan.data.push(track);
                    }
                });
            },

            unSelect() {
                this.selectedIndex = null;
            },

            mapMediaSourceIcon,
            mapMediaSourceName,

            ...mapMutations([
                UPDATE_QUEUE,
                UPDATE_PLAYING_QUEUE_INDEX,
                ADD_TRACK,
                UPDATE_TRACK
            ])
        },

        filters: {
            formatDuration
        },

        created() {
            document.addEventListener('click', this.unSelect);
        },

        destroyed() {
            document.removeEventListener('click', this.unSelect);
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
                margin: 2px;
                line-height: 0;
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
            margin-top: 25px;
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

                img {
                    width: 15px;
                    height: 15px;
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

    .sortable-drag {
        color: #fff;

        td {
            padding: 0 2px;

            svg {
                width: 18px;
                height: 18px;
                fill: #fff;
                vertical-align: middle;
            }

            img {
                width: 15px;
                height: 15px;
                vertical-align: middle;
            }
        }
    }
</style>