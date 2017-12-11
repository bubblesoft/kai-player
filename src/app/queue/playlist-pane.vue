<template lang="pug">
    .wrap
        table.table-condensed.table.table-hover
            tbody
                tr(v-for="queue in queues")
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
        }
    }
</style>