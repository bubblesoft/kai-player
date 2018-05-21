<template lang="pug">
    .source-pane
        table.table-condensed.table.table-hover
            tbody
                tr(
                    v-for="(source, index) in sources"
                )
                    td
                        input(
                            v-model="source.active"
                            type="checkbox"
                        )
                    td {{ source.name }}

</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    import { UPDATE_SOURCE } from '../../scripts/mutation-types';

    export default {
        data() {
            return {
                sources: []
            }
        },

        computed: {
            ...mapState({
                sourceGroup: state => state.sourceModule.sourceGroup
            })
        },

        methods: {
            loadSources() {
                this.sources = this.sourceGroup.get();

                this.sources.forEach((source, index) => {
                    this.$watch(() => {
                        return this.sources[index].active;
                    }, to => {
                        this[UPDATE_SOURCE]({ index, active: to });
                    });
                });
            },

            ...mapMutations([
                UPDATE_SOURCE
            ])
        },

        created() {
            if (this.sourceGroup.length) {
                this.loadSources();
            }
        },

        watch: {
            'sourceGroup.length' () {
                this.loadSources();
            }
        }
    }
</script>

<style lang="scss" scoped>
    .source-pane {
        height: 100%;
        overflow: auto;

        tr {
            cursor: default;
        }
    }
</style>