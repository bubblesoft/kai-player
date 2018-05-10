<template lang="pug">
    .playlist-pane
        .toolbar
            .tool-button(v-interact:tap="() => { insert(typeof selectedIndex === 'number' ? selectedIndex + 1 : queueGroup.length); }")
                svg(
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                )
                    path(d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z")
            tooltip(
                v-if="editMode"
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
                        v-interact:tap="() => { select(index); }"
                        @contextmenu.prevent="handleContextMenu(queue, index);"
                        :class="{ active: selectedIndex === index, 'active-queue': activeIndex === index }"
                    )
                        td.drag-handle(v-if="editMode")
                            svg(
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                            )
                                path(d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z")
                        td(style="width:18px")
                            svg(
                                v-if="index === playingIndex"
                                width="20"
                                height="20"
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
//                    if (this.queueGroup.length === 0) {
//                        this.queueGroup.add(this.trashCan.data.splice(e.newIndex, 1)[0]);
//                    } else {
                        if (e.oldIndex < this.activeIndex || e.oldIndex === this.activeIndex && this.activeIndex === this.queues.length) {
                            this.activeIndex--;
                        }

                        if (e.oldIndex === this.playingIndex) {
                            this.player.unload();
                            this.playingIndex = null;
                        } else if (e.oldIndex < this.playingIndex) {
                            this.playingIndex--;
                        }
//                    }

                    this.trashCan.data.forEach((queue, index) => {
                        if (queue.constructor === RandomQueue) {
                            this.queueGroup.add(this.trashCan.data.splice(index, 1)[0]);
                        }
                    });
                }
            },

            handleContextMenu(queue, index) {
                this.$emit('contextMenu', async type => {
                    if (type === 'open') {
                        this.activeIndex = index;
                    } else if (type === 'create') {
                        this.insert(typeof this.selectedIndex === 'number' ? this.selectedIndex + 1 : this.queueGroup.length);
                    } else if (type === 'remove') {
                        try {
                            await this.$confirm({
                                title: this.$t('Confirm'),
                                bodyText: this.$t('Remove the playlist?'),
                                confirmText: this.$t('Confirm'),
                                cancelText: this.$t('Cancel')
                            });


                            this.queues = this.queues.slice(0, index).concat(this.queues.slice(index + 1));
                            trashCan.data.push(queue);
                        } catch (e) { }
                    }
                });
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

            tr {
                cursor: default;

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
        }
    }
</style>