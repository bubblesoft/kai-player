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
            draggable.tool-button(
                v-model="trashCan.data"
                :options="{ group: 'queues' }"
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
            table.table-condensed.table.table-hover
                draggable(
                    v-model="queues"
                    :options="{ group: 'queues' }"
                    @sort="onSort"
                    @start="dragging = true"
                    @end="dragging = false"
                    element="tbody"
                )
                    tr(
                        v-for="(queue, index) in queues"
                        @dblclick="activeIndex = index;"
                        @click="select(index)"
                        :class="{ active: selectedIndex === index, 'queue-active': activeIndex === index }"
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
                                :height="30"
                            )
                        td {{ queue.length }}
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    import { UPDATE_QUEUE_GROUP, INSERT_QUEUE, UPDATE_PLAYING_QUEUE_INDEX } from '../../scripts/mutation-types';

    import Queue from './Queue';

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
                dragging: false,
                trashCan: {
                    hover: false,
                    data: []
                }
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
                    this[UPDATE_PLAYING_QUEUE_INDEX]({ index });
                }
            },
            ...mapState({
                queueGroup: state => state.queueModule.queueGroup,
                player: state => state.playerModule.player,
                i18n: state => state.generalModule.i18n
            })
        },
        methods: {
            insert(index) {
                this[INSERT_QUEUE]({
                    index,
                    queue: new Queue({ name: this.i18n.t('New Playlist') })
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
                        this.playingIndex--
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

                    if (e.oldIndex === this.activeIndex) {

                    }
                }
            },
            ...mapMutations([
                INSERT_QUEUE,
                UPDATE_QUEUE_GROUP,
                UPDATE_PLAYING_QUEUE_INDEX
            ])
        },
        created() {
            this.queueGroup.insert(0, new Queue({ name: this.i18n.t('Temp') }));
            document.addEventListener('click', () => {
               this.selectedIndex = null;
            });
        }
    }
</script>

<style lang="scss" scoped>
    .playlist-pane {
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