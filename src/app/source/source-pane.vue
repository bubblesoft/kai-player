<template lang="pug">
    .source-pane(v-if="sources.length")
        table.table-condensed.table.table-hover
            tbody
                tr(
                    v-for="(source) in sources"
                )
                    td
                        input(
                            v-model="source.active"
                            type="checkbox"
                        )
                    td
                        img(
                            :src="source.icons[0]"
                        )
                    td {{ source.name }}
    vueLoading(
        v-else
        type="cylon"
        color="#fff"
    )
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    import vueLoading from "vue-loading-template";

    import { UPDATE_SOURCE } from '../../scripts/mutation-types';

    export default {
        components: {
            vueLoading,
        },

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

            img {
                vertical-align: top;
                width: 15px;
                height: 15px;
                margin-top: 2px;
            }
        }
    }

    .vue-loading {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
    }
</style>