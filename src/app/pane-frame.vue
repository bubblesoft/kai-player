<template lang="pug">
    .panel.panel-default(:id="'panel_' + type")
        .panel-heading {{ panelHeading }}
        .panel-body
            .panel-body__wrap
                div(:is="mapComponent(type)")
</template>

<script>
    import { mapState } from 'vuex';

    import jQuery from 'jquery';
    import interact from 'interactjs';

    import { mapPanelHeading } from '../scripts/utils';

    import playlistPane from './queue/playlist-pane';
    import tracksPane from './queue/tracks-pane';

    export default {
        props: {
            type: String
        },
        data: () => {
            return {
                panelHeading: 'Panel',
                ratioX: 0,
                ratioY: 0
            }
        },
        computed: {
            ...mapState({
                i18n: state => state.generalModule.i18n
            })
        },
        components: {
            playlistPane,
            tracksPane
        },
        methods: {
            onWindowResize() {
                const $panel = jQuery('#panel_' + this.type),
                    viewportWidth = jQuery(window).width(),
                    viewportHeight = jQuery(window).height(),
                    width = $panel.width(),
                    height = $panel.height(),
                    x = viewportWidth * this.ratioX - width / 2,
                    y = viewportHeight * this.ratioY - height / 2;

                $panel.css('transform', 'translate(' + x + 'px, ' + y + 'px)');
                $panel.attr('data-x', x);
                $panel.attr('data-y', y);
            },
            mapComponent(type) {
                switch (type) {
                    case 'playlist':
                        return 'playlist-pane';
                    case 'tracks':
                        return 'tracks-pane';
                    default:
                        return null;
                }
            }
        },
        created() {
            this.panelHeading = this.i18n.t(mapPanelHeading(this.type));
        },
        mounted() {
            const viewportWidth = jQuery(window).width(),
                viewportHeight = jQuery(window).height(),
                controlBarHeight = jQuery('#control-bar').height() + 10,
                width = viewportWidth * .2 > 300 ? viewportWidth * .2 : 300;

            let x, y, height;

            switch (this.type) {
                case 'playlist':
                    x = viewportWidth - width;
                    y = 0;
                    height = viewportHeight * .3;
                    break;
                case 'tracks':
                    x = viewportWidth - width;
                    y = viewportHeight * .3;
                    height = viewportHeight * .5;
            }

            const $panel = jQuery('#panel_' + this.type);

            $panel
                .css('transform', 'translate(' + x + 'px, ' + y + 'px)')
                .attr('data-x', x)
                .attr('data-y', y)
                .width(width)
                .height(height);

            this.ratioX = (x + width / 2) / viewportWidth;
            this.ratioY = (y + height / 2) / viewportHeight;

            jQuery(window).bind('resize', this.onWindowResize);

            const dragMoveListener =  (event) => {
                const viewportWidth = jQuery(window).width(),
                    viewportHeight = jQuery(window).height(),
                    $panel = jQuery(event.target),

                    // keep the dragged position in the data-x/data-y attributes
                    x = (parseFloat($panel.attr('data-x')) || 0) + event.dx,
                    y = (parseFloat($panel.attr('data-y')) || 0) + event.dy;

                    $panel.css('transform', 'translate(' + x + 'px, ' + y + 'px)'); // translate the element

                // update the posiion attributes
                $panel.attr('data-x', x);
                $panel.attr('data-y', y);

                this.ratioX = (x + width / 2) / viewportWidth;
                this.ratioY = (y + width / 2) / viewportHeight;
            };

            interact('#panel_' + this.type, {
                ignoreFrom: '.panel-body__wrap'
            })
                .draggable({
                    inertia: true, // enable inertial throwing
                    restrict: {
                        restriction: 'parent',
                    },
                    onmove: dragMoveListener,
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
            margin: 50px 8px 8px;
            width: auto;
            height: auto;
        }
    }
</style>