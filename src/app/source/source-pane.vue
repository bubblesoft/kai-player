<template lang="pug">
    .source-pane
        table.table-condensed.table.table-hover
            tbody
                tr(
                    v-for="source in sources"
                )
                    td
                        input(
                            v-model="source.active"
                            type="checkbox"
                        )
                    td {{ source.name }}

</template>

<script>
    import { mapState } from 'vuex';

    export default {
        computed: {
            ...mapState({
                sources: state => state.sourceModule.sources,
                sourceGroup: state => state.sourceModule.sourceGroup
            })
        }
    }
</script>

<style lang="scss" scoped>
    .source-pane {
        height: 100%;
        background-color: rgba(255, 255, 255, .15);
        overflow: auto;

        tr {
            cursor: default;
        }
    }
</style>