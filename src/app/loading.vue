<template lang="pug">
    .loading
        vueLoading(
            v-if="performanceFactor >= .4"
            type="barsCylon"
            color="#fff"
        )
        .loading-text(v-else) {{ $t("loading...") }}
</template>

<script lang="ts">
    import { Component, Vue } from "vue-property-decorator";
    import { State } from "vuex-class";

    // @ts-ignore
    import vueLoading from "vue-loading-template";

    import config from "../config";

    @Component({ components: { vueLoading } })
    export default class extends Vue {
        @State((state) => state.generalModule.preference || config.defaultPreference) private preference!: any;

        private get performanceFactor() {
            return this.preference.performanceFactor;
        }
    }
</script>

<style lang="scss" scoped>
    .loading {
        /*position: absolute;*/
        /*left: 0;*/
        /*top: 0;*/
        /*right: 0;*/
        /*bottom: 0;*/

        .vue-loading {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
        }

        .loading-text {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            height: 20px;
            margin: auto;
            line-height: 20px;
            text-align: center;
        }
    }
</style>

<style lang="scss">
    .vue-loading svg {
        margin-left: 7px;
        margin-top: 3px;
    }
</style>
