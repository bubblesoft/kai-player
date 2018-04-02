<template lang="pug">
    .panel-frame(:class="{ active: activePanelIndex === type }")
        .panel.panel-default(
            :style="{ backgroundPosition: (1 - ratioX + ratioY) * 50 + 10 + '% ' + '0', backgroundColor: frameBackgroundColor }"
            :class="{ hide: type === 'picture' }"
        )
        .panel-heading
            div {{ $t(heading) }}
        .opacity-control
            vueSlider(
                v-if="activePanelIndex === type"
                v-model="opacity"
                :max="1"
                :interval=".01"
                tooltip="hover"
                :stop-propagation="true"
                :real-time="true"
                :bg-style="{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }"
                :slider-style="{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }"
                :process-style="{ backgroundColor: 'rgba(255, 255, 255, 0.9)', filter: 'drop-shadow(2px 2px 10px rgba(150, 150, 150, 1))' }"
                :tooltip-style="{ backgroundColor: 'rgba(255, 255, 255, 0.6)', 'border-color': 'rgba(255, 255, 255, 0.6)', 'border-style': 'none' }"
            )
        .panel-body(:style="{ backgroundColor: contentBackgroundColor }")
            slot
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    import interact from 'interactjs';
    import { scaleLinear } from 'd3';

    import vueSlider from 'vue-slider-component';

    import { UPDATE_ACTIVE_PANEL_INDEX, SET_ACTIVE_PANEL_INDEX_LOCK } from '../scripts/mutation-types';

    const scale = scaleLinear()
            .domain([0, .4, 1])
            .range([0, .3, 1]);

    export default {
        props: {
            type: String,
            heading: {
                type: String,
                default: 'Panel'
            }
        },
        components: {
            vueSlider
        },
        data: () => {
            return {
                ratioX: 0,
                bottomY: 0,

                // Whether attached to a side.
                attachedToHorizontal1: null,
                attachedToVertical1: null,
                attachedToHorizontal2: null,
                attachedToVertical2: null,

                opacity: .4,
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
            },
            frameBackgroundColor() {
                const scaledOpacity = scale(this.opacity),
                        colorComponent = Math.round(10 / scaledOpacity);

                return 'rgba(' + colorComponent + ',' + colorComponent + ',' + colorComponent + ',' +  scaledOpacity + ')';
            },
            contentBackgroundColor() {
                const scaledOpacity = scale(this.opacity),
                        colorComponent = Math.round(20 / scaledOpacity);

                return 'rgba(' + colorComponent + ',' + colorComponent + ',' + colorComponent + ',' +  scaledOpacity + ')';
            },
            ratioY() {
                return this.bottomY / window.innerHeight;
            }
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
            activate() {
                const activate = () => {
                    document.removeEventListener('click', activate);
                    this[SET_ACTIVE_PANEL_INDEX_LOCK](false);
                    this.activePanelIndex = this.type;
                };

                document.addEventListener('click', activate);
                this[SET_ACTIVE_PANEL_INDEX_LOCK](true);
            },
            ...mapMutations([
                UPDATE_ACTIVE_PANEL_INDEX,
                SET_ACTIVE_PANEL_INDEX_LOCK
            ])
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

            const interactable = interact(this.$el)
                .on('tap', e => {
                    e.preventDefault();
                    this.activate();
                })
                .draggable({
                    ignoreFrom: '.panel-body, .opacity-control',
                    restrict: {
                        restriction: 'parent',
                        endOnly: true
                    },
                    inertia: true,
                    onmove: e => {
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
                    },
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
                    ignoreFrom: '.panel-body, .panel-heading, .opacity-control',
                    edges: { left: true, right: true, bottom: true, top: true },
                    restrictEdges: {
                        outer: 'parent',
                        endOnly: true
                    },
                    restrictSize: {
                        min: { width: 150, height: 150 }
                    },
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

            .panel {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-image: url(../assets/highlight.svg),
                linear-gradient(110deg, rgba(255, 255, 255, .2) 0%, rgba(255, 255, 255, 0) 8%),
                linear-gradient(110deg, rgba(255, 255, 255, 0) 95%, rgba(255, 255, 255, .1) 100%);
                background-repeat: no-repeat;
                z-index: -1;

                &.hide {
                    opacity: 0;
                }
            }

            &:hover .hide {
                opacity: 1;
            }

            &.active {
                 z-index: 2;
                 opacity: 1;

                .panel {
                    box-shadow: 0 0 60px 8px rgba(255, 255, 255, 0.1),
                    0 0 25px rgba(0, 0, 0, 0.1),
                    inset 0 0 20px rgba(255, 255, 255, 0.1);
                }
            }

            .panel-heading {
                display: flex;
                justify-content: space-between;
                margin: 8px 8px 0;
                padding: 2px 7px 10px;
                background: linear-gradient(110deg, rgba(255, 255, 255, 0) 95%, rgba(255, 255, 255, .08) 100%);
                transition: background .2s;
            }

            .opacity-control {
                position: absolute;
                top: 2px;
                right: 2px;
                width: 50%;
                max-width: 200px;
                height: 37px;

                .vue-slider-component {
                    margin: 6px;
                    opacity: .6;
                    cursor: default;
                }
            }

            .panel-body {
                position: absolute;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                width: auto;
                height: auto;
                margin: 50px 8px 8px;
                padding: 0;
                background-color: rgba(255, 255, 255, .15);
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