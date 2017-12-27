<template lang="pug">
    .panel.panel-default
        .panel-heading {{ i18n.t(mapPanelHeading(type)) }}
        .panel-body
            .panel-body__wrap
</template>

<script>
    import { mapState } from 'vuex';

    import jQuery from 'jquery';
    import interact from 'interactjs';

    import { mapPanelHeading } from '../scripts/utils';

    export default {
        props: {
            type: String
        },
        data: () => {
            return {
                ratioX: 0,
                bottomY: 0,

                // Whether attached to a side.
                attachedToHorizontal1: null,
                attachedToVertical1: null,
                attachedToHorizontal2: null,
                attachedToVertical2: null
            }
        },
        computed: mapState({
            i18n: state => state.generalModule.i18n
        }),
        methods: {
            onWindowResize() {
                const $panel = jQuery(this.$el),
                    viewportWidth = jQuery(window).width(),
                    viewportHeight = jQuery(window).height(),
                    controlBarHeight = jQuery('#control-bar').height() + 10,
                    width = $panel.width(),
                    height = $panel.height();

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

                $panel.css('transform', 'translate(' + x + 'px, ' + y + 'px)');
                $panel.attr('data-x', x);
                $panel.attr('data-y', y);
            },
            mapPanelHeading
        },
        mounted() {
            const viewportWidth = jQuery(window).width(),
                viewportHeight = jQuery(window).height(),
                controlBarHeight = jQuery('#control-bar').height() + 10,
                width = viewportWidth * .2 > 300 ? viewportWidth * .2 : 300,
                height = viewportHeight * .5;

            let x, y;

            switch (this.type) {
                case 'playlist':
                    x = (viewportWidth - width);
                    y = (viewportHeight - height - controlBarHeight - 2);
                    this.attachedToHorizontal = 'right';
                    this.attachedToVertical = null;
                    break;
            }

            const $panel = jQuery(this.$el);

            $panel
                .css('transform', 'translate(' + x + 'px, ' + y + 'px)')
                .attr('data-x', x)
                .attr('data-y', y)
                .width(width)
                .height(height);

            this.ratioX = (x + width / 2) / viewportWidth;
            this.bottomY = viewportHeight - controlBarHeight - y - height;

            jQuery(window).bind('resize', this.onWindowResize);

            const dragMoveListener =  (event) => {
                const viewportWidth = jQuery(window).width(),
                    viewportHeight = jQuery(window).height(),
                    controlBarHeight = jQuery('#control-bar').height() + 10,
                    $panel = jQuery(event.target),
                    height = $panel.height(),

                    // keep the dragged position in the data-x/data-y attributes
                    x = (parseFloat($panel.attr('data-x')) || 0) + event.dx,
                    y = (parseFloat($panel.attr('data-y')) || 0) + event.dy;

                // translate the element
                    $panel.css('transform', 'translate(' + x + 'px, ' + y + 'px)');

                // update the posiion attributes
                $panel.attr('data-x', x);
                $panel.attr('data-y', y);

                this.ratioX = (x + width / 2) / viewportWidth;
                this.bottomY = viewportHeight - controlBarHeight - y - height;
            };

            let count = 1;

            interact(this.$el, {
                ignoreFrom: '.panel-body__wrap'
            })
                .draggable({
                    inertia: true, // enable inertial throwing
                    restrict: {
                        restriction: 'parent',
                    },
                    onmove: dragMoveListener,
                    snap: {
                        targets: [
                            (x, y, test) => {
                                const viewportWidth = jQuery(window).width(),
                                    viewportHeight = jQuery(window).height(),
                                    $panel = jQuery(this.$el),
                                    width = $panel.width(),
                                    height = $panel.height();

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
                            {x: 0, y: 0}, // snap relative to the element's top-left
                        ]
                    }
                })
                .resizable({
                    edges: { left: true, right: true, bottom: true, top: true }, // resize from all edges and corners
                    restrictSize: {
                        min: { width: 150, height: 300 }, // minimum size
                    },
                })
                .on('resizemove', function (event) {
                    var $panel = jQuery(event.target),
                            x = (parseFloat($panel.attr('data-x')) || 0),
                            y = (parseFloat($panel.attr('data-y')) || 0);

                    // update the element's style
                    $panel.css('width', event.rect.width + 'px');
                    $panel.css('height', event.rect.height + 'px');

                    // translate when resizing from top or left edges
                    x += event.deltaRect.left;
                    y += event.deltaRect.top;

                    $panel.css('transform', 'translate(' + x + 'px,' + y + 'px)');

                    $panel.attr('data-x', x);
                    $panel.attr('data-y', y);
                });
        },
        destroyed() {
            jQuery(window).unbind('resize', this.onWindowResize);
        }
    }
</script>

<style lang="scss" scoped>
    .panel {
        position: absolute;
        left: 0;
        top: 0;

        .panel-body__wrap {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            margin: 47px 5px 5px;
            width: auto;
            height: auto;
        }
    }
</style>