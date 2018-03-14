<template lang="pug">
    .playlist-pane
        .toolbar
            .tool-button(@click="insert(typeof selectedIndex === 'number' ? selectedIndex + 1 : queueGroup.length)")
                svg(
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                )
                    path(d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z")
            tooltip(
                effect="fadein"
                placement="top"
                :content="$t('Drag a playlist here to remove it')"
            )
                draggable.tool-button(
                    v-model="trashCan.data"
                    :options="{ group: 'queues', draggable: '' }"
                    @pointerover.native="trashCan.hover = true"
                    @pointerleave.native="trashCan.hover = false"
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
            table.table-condensed.table.table-hover
                draggable(
                    v-model="queues"
                    :options="{ group: 'queues', handle: '.drag-handle', forceFallback: true, fallbackOnBody: true }"
                    @sort="onSort"
                    @start="dragging = true"
                    @end="dragging = false"
                    element="tbody"
                )
                    tr(
                        v-for="(queue, index) in queues"
                        v-interact:doubletap="() => activeIndex = index"
                        @click="select(index)"
                        :class="{ active: selectedIndex === index, 'active-queue': activeIndex === index }"
                    )
                        td(style="width:18px")
                            svg(
                                v-if="index === playingIndex"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                            )
                                path(d="M8 5v14l11-7z")
                        td(style="padding: 0;")
                            editableBox(
                                v-model="queue.name"
                                :editable="editMode"
                                :height="30"
                            )
                        td(v-if="queue.constructor === RandomQueue") ∞
                        td(v-else) {{ queue.length }}
                        td.drag-handle(v-if="editMode")
                            svg(
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                            )
                                path(d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z")
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    import { UPDATE_QUEUE_GROUP, INSERT_QUEUE, UPDATE_PLAYING_QUEUE_INDEX } from '../../scripts/mutation-types';

    import Queue from './Queue';
    import RandomQueue from './RandomQueue';

    import draggable from 'vuedraggable';
    import tooltip from 'vue-strap/src/tooltip';

    import editableBox from '../editable-box';

    export default {
        components: {
            draggable,
            tooltip,
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
            queues: {
                get() {
                    return this.queueGroup.get();
                },
                set(queues) {
                    this[UPDATE_QUEUE_GROUP]({ queues });
                }
            },

            activeIndex: {
                get() {
                    return this.queueGroup.active;
                },
                set(active) {
                    this[UPDATE_QUEUE_GROUP]({ active });
                }
            },

            playingIndex: {
                get() {
                    return this.$store.state.queueModule.playingQueueIndex;
                },
                set(index) {
                    this[UPDATE_PLAYING_QUEUE_INDEX](index);
                }
            },

            ...mapState({
                queueGroup: state => state.queueModule.queueGroup,
                player: state => state.playerModule.playerController.player
            })
        },
        methods: {
            insert(index) {
                this[INSERT_QUEUE]({
                    index,
                    queue: new Queue({ name: this.$t('New Playlist') })
                });
            },

            select(index) {
                const select = () => {
                    document.removeEventListener('click', select);
                    this.selectedIndex = index;
                };

                document.addEventListener('click', select);
            },

            onSort(e) {
                if (e.from === e.to) {
                    if (e.oldIndex === this.activeIndex) {
                        this.activeIndex = e.newIndex;
                    } else if (e.oldIndex > this.activeIndex && e.newIndex <= this.activeIndex) {
                        this.activeIndex++;
                    } else if (e.oldIndex < this.activeIndex && e.newIndex >= this.activeIndex) {
                        this.activeIndex--
                    }

                    if (e.oldIndex === this.playingIndex) {
                        this.playingIndex = e.newIndex;
                    } else if (e.oldIndex > this.playingIndex && e.newIndex <= this.playingIndex) {
                        this.playingIndex++;
                    } else if (e.oldIndex < this.playingIndex && e.newIndex >= this.playingIndex) {
                        this.playingIndex--;
                    }
                } else if (e.from !== e.to) {
                    if (this.queueGroup.length === 0) {
                        return this.queueGroup.add(this.trashCan.data[e.newIndex]);
                    }

                    if (e.oldIndex === this.playingIndex) {
                        this.player.unload();
                        this.playingIndex = null;
                    } else if (e.oldIndex < this.playingIndex) {
                        this.playingIndex--;
                    }
                }
            },

            unSelect() {
                this.selectedIndex = null;
            },

            ...mapMutations([
                INSERT_QUEUE,
                UPDATE_QUEUE_GROUP,
                UPDATE_PLAYING_QUEUE_INDEX
            ])
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
    .playlist-pane {
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

            tr {
                cursor: default;

                &.active {
                    cursor: move;
                }

                &.active-queue {
                    background-color: rgba(0, 0, 0, .3);
                }

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

    .sortable-fallback {
        color: #fff;
    }
</style>