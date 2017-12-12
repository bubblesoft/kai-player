<template lang="pug">
    .wrap
        table.table-condensed.table.table-hover
            tbody
                tr(v-for="(queue, index) in queues")
                    td(style="width:18px")
                        svg(
                            v-if="index === activeIndex"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        )
                            path(d="M8 5v14l11-7z")
                    td {{ queue.name }}
                    td {{ queue.length }}
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        computed: {
            queues() {
                return this.queueGroup.get();
            },
            activeIndex() {
                return this.queueGroup.active;
            },
            ...mapState({
                queueGroup: state => state.queueModule.queueGroup
            })
        }
    }
</script>

<style lang="scss" scoped>
    .wrap {
        height: 100%;
        background-color: rgba(255, 255, 255, .15);

        tr {
            cursor: default;

            svg {
                width: 18px;
                height: 18px;
                fill: #fff;
            }
        }
    }
</style>