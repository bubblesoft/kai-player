<template lang="pug">
    .panel-frame.panel.panel-default(
        :class="{ active: activePanelIndex === type }"
    )
        .panel-heading {{ panelHeading }}
        .panel-body
            .panel-body__wrap
                div(:is="mapComponent(type)")
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    import interact from 'interactjs';

    import { mapPanelHeading } from '../scripts/utils';

    import { UPDATE_ACTIVE_PANEL_INDEX, SET_ACTIVE_PANEL_INDEX_LOCK } from '../scripts/mutation-types';

    import listPane from './source/list-pane';
    import sourcePane from './source/source-pane';
    import playlistPane from './queue/playlist-pane';
    import tracksPane from './queue/tracks-pane';
    import searchPane from './source/search-pane';

    export default {
        props: {
            type: String
        },
        data: () => {
            return {
                panelHeading: 'Panel',
                ratioX: 0,
                bottomY: 0,

                // Whether attached to a side.
                attachedToHorizontal1: null,
                attachedToVertical1: null,
                attachedToHorizontal2: null,
                attachedToVertical2: null,

                interactables: []
            }
        },
        computed: {
            activePanelIndex: {
                get() {
                    return this.$store.state.generalModule.activePanel.index;
                },
                set(panelType) {
                    this[UPDATE_ACTIVE_PANEL_INDEX](panelType);
                }
            }
        },
        components: {
            sourcePane,
            listPane,
            playlistPane,
            tracksPane,
            searchPane
        },
        methods: {
            onWindowResize() {
                const panel = this.$el,
                    viewportWidth = window.innerWidth,
                    viewportHeight = window.innerHeight,
                    controlBarHeight = document.querySelector('#control-bar').offsetHeight,
                    width = panel.offsetWidth,
                    height = panel.offsetHeight;

                let x, y;

                if (this.attachedToHorizontal === 'left') {
                    x = 0;
                } else if (this.attachedToHorizontal === 'right') {
                    x = viewportWidth - width;
                } else {
                    x = viewportWidth * this.ratioX - width / 2
                }

                if (this.attachedToVertical === 'top') {
                    y = 0;
                } else if (this.attachedToVertical === 'bottom') {
                    y = viewportHeight - height;
                } else {
                    y = viewportHeight - controlBarHeight - this.bottomY - height - 2;
                }

                panel.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
                panel.setAttribute('data-x', x);
                panel.setAttribute('data-y', y);
            },
            mapComponent(type) {
                switch (type) {
                    case 'source':
                        return 'source-pane';
                    case 'list':
                        return 'list-pane';
                    case 'playlist':
                        return 'playlist-pane';
                    case 'tracks':
                        return 'tracks-pane';
                    case 'search':
                        return 'search-pane';
                    default:
                        return null;
                }
            },
            activate() {
                const activate = () => {
                    document.removeEventListener('click', activate);
                    this[SET_ACTIVE_PANEL_INDEX_LOCK](false);
                    this.activePanelIndex = this.type;
                };

                document.addEventListener('click', activate);
                this[SET_ACTIVE_PANEL_INDEX_LOCK](true);
            },
            mapPanelHeading,
            ...mapMutations([
                UPDATE_ACTIVE_PANEL_INDEX,
                SET_ACTIVE_PANEL_INDEX_LOCK
            ])
        },
        created() {
            this.panelHeading = this.$t(mapPanelHeading(this.type));
        },
        mounted() {
            const viewportWidth = window.innerWidth,
                viewportHeight = window.innerHeight,
                controlBarHeight = document.querySelector('#control-bar').offsetHeight;

            let x, y, height, width;

            if (viewportWidth < 600) {
                width = viewportWidth;

                switch (this.type) {
                    case 'source':
                        height = viewportHeight * .2;
                        x = 0;
                        y = viewportHeight - viewportHeight * .3 - viewportHeight * .25 - height - controlBarHeight - 2;
                        this.attachedToHorizontal = 'left';
                        this.attachedToVertical = null;
                        break;
                    case 'list':
                        height = viewportHeight * .3;
                        x = 0;
                        y = viewportHeight - viewportHeight * .3 - viewportHeight * .25 - height - controlBarHeight - 2;
                        this.attachedToHorizontal = 'left';
                        this.attachedToVertical = null;
                        break;
                    case 'playlist':
                        height = viewportHeight * .25;
                        x = viewportWidth - width;
                        y = viewportHeight - viewportHeight * .3 - height - controlBarHeight - 2;
                        this.attachedToHorizontal = 'left';
                        this.attachedToVertical = null;
                        break;
                    case 'tracks':
                        height = viewportHeight * .3;
                        x = viewportWidth - width;
                        y = viewportHeight - height - controlBarHeight - 2;
                        this.attachedToHorizontal = 'left';
                        this.attachedToVertical = null;
                        break;
                    case 'search':
                        height = viewportHeight * .3;
                        x = 0;
                        y = viewportHeight - viewportHeight * .3 - viewportHeight * .25 - height - controlBarHeight - 2;
                        this.attachedToHorizontal = 'left';
                        this.attachedToVertical = null;
                        break;
                    default:
                        x = 0;
                        y = 0;
                        height = viewportHeight * .3;
                }
            } else {
                width = viewportWidth * .3;

                (width < 300) && (width = 300);
                (width > 500) && (width = 500);

                switch (this.type) {
                    case 'source':
                        height = viewportHeight * .2;
                        x = 0;
                        y = viewportHeight - viewportHeight * .6 - height - controlBarHeight - 2;
                        this.attachedToHorizontal = 'left';
                        this.attachedToVertical = null;
                        break;
                    case 'list':
                        height = viewportHeight * .3;
                        x = 0;
                        y = viewportHeight - viewportHeight * .3 - height - controlBarHeight - 2;
                        this.attachedToHorizontal = 'left';
                        this.attachedToVertical = null;
                        break;
                    case 'playlist':
                        height = viewportHeight * .3;
                        x = viewportWidth - width;
                        y = viewportHeight - viewportHeight * .4 - height - controlBarHeight - 2;
                        this.attachedToHorizontal = 'right';
                        this.attachedToVertical = null;
                        break;
                    case 'tracks':
                        height = viewportHeight * .4;
                        x = viewportWidth - width;
                        y = viewportHeight - height - controlBarHeight - 2;
                        this.attachedToHorizontal = 'right';
                        this.attachedToVertical = null;
                        break;
                    case 'search':
                        height = viewportHeight * .3;
                        x = 0;
                        y = viewportHeight - height - controlBarHeight - 2;
                        this.attachedToHorizontal = 'left';
                        this.attachedToVertical = null;
                        break;
                    default:
                        x = 0;
                        y = 0;
                        height = viewportHeight * .3;
                }
            }

            const panel = this.$el;

            panel.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            panel.setAttribute('data-x', x);
            panel.setAttribute('data-y', y);
            panel.style.width = width + 'px';
            panel.style.height = height + 'px';

            this.ratioX = (x + width / 2) / viewportWidth;
            this.bottomY = viewportHeight - controlBarHeight - y - height;

            window.addEventListener('resize', this.onWindowResize);

            const dragMoveListener =  e => {
                const viewportWidth = window.innerWidth,
                    viewportHeight = window.innerHeight,
                    controlBarHeight = document.querySelector('#control-bar').offsetHeight,
                    panel = e.target,
                    height = panel.offsetHeight,

                    // keep the dragged position in the data-x/data-y attributes
                    x = (parseFloat(panel.getAttribute('data-x')) || 0) + e.dx,
                    y = (parseFloat(panel.getAttribute('data-y')) || 0) + e.dy;

                    panel.style.transform = 'translate(' + x + 'px, ' + y + 'px)'; // translate the element

                // update the posiion attributes
                panel.setAttribute('data-x', x);
                panel.setAttribute('data-y', y);

                this.ratioX = (x + width / 2) / viewportWidth;
                this.bottomY = viewportHeight - controlBarHeight - y - height;
            };

            const interactable = interact(this.$el)
                .on('tap', e => {
                    e.preventDefault();
                    this.activate();
                })
                .draggable({
                    ignoreFrom: '.panel-body__wrap',
                    restrict: {
                        restriction: 'parent',
                        endOnly: true
                    },
                    inertia: true,
                    onmove: dragMoveListener,
                    snap: {
                        targets: [
                            (x, y, test) => {
                                const viewportWidth = window.innerWidth,
                                    viewportHeight = window.innerHeight,
                                    panel = this.$el,
                                    width = panel.offsetWidth,
                                    height = panel.offsetHeight;

                                if (Math.abs(x) < 30) {
                                    this.attachedToHorizontal = 'left';
                                    return { x: 0, y: y };
                                } else {
                                    this.attachedToHorizontal = null;
                                }

                                if (Math.abs(x + width - viewportWidth) < 30) {
                                    this.attachedToHorizontal = 'right';
                                    return { x: viewportWidth - width, y: y };
                                } else {
                                    this.attachedToHorizontal = null;
                                }

                                if (Math.abs(y) < 30) {
                                    this.attachedToVertical = 'top';
                                    return { x: x, y: 0 };
                                } else {
                                    this.attachedToVertical = null;
                                }

                                if (Math.abs(y + height - viewportHeight) < 30) {
                                    this.attachedToVertical = 'bottom';
                                    return { x: x, y: viewportHeight - height };
                                } else {
                                    this.attachedToVertical = null;
                                }
                            }
                        ],
                        relativePoints: [
                            { x: 0, y: 0 } // snap relative to the element's top-left
                        ]
                    }
                })
                .resizable({
                    ignoreFrom: '.panel-body__wrap',
                    edges: { left: true, right: true, bottom: true, top: true },
                    restrictEdges: {
                        outer: 'parent',
                        endOnly: true
                    },
//                    restrictSize: {
//                        min: { width: 150, height: 300 }
//                    },
                    inertia: true
                })
                .on('resizemove', e => {
                    const panel = e.target;

                    let x = (parseFloat(panel.getAttribute('data-x')) || 0),
                        y = (parseFloat(panel.getAttribute('data-y')) || 0);

                    // update the element's style
                    panel.style.width = e.rect.width + 'px';
                    panel.style.height = e.rect.height + 'px';

                    // translate when resizing from top or left edges
                    x += e.deltaRect.left;
                    y += e.deltaRect.top;

                    panel.style.transform = 'translate(' + x + 'px,' + y + 'px)';

                    panel.setAttribute('data-x', x);
                    panel.setAttribute('data-y', y);
                });

            this.interactables.push(interactable);
        },
        destroyed() {
            this.interactables.forEach(interactable => interactable.unset());

            window.removeEventListener('resize', this.onWindowResize);
        }
    }
</script>

<style lang="scss" scoped>
    .panel-frame {
        position: absolute;
        left: 0;
        top: 0;
        opacity: .9;
        z-index: 1;
        touch-action: none;

        &.active {
            box-shadow: 0 0 60px 8px rgba(255, 255, 255, 0.15),
                0 0 25px rgba(0, 0, 0, 0.1),
                inset 0 0 1px rgba(255, 255, 255, 0.6);

            opacity: 1;
            z-index: 2;
        }

        .panel-body__wrap {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            margin: 50px 8px 8px;
            width: auto;
            height: auto;
        }
    }
</style>

<style lang="scss">
    .panel-frame {
        .panel-heading, td, input, select {
            color: rgba(255, 255, 255, .7);
        }

        &.active {
            .panel-heading, td, input, select {
                color: #fff;
            }
        }
    }
</style>