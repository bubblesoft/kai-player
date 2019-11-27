<template lang="pug">
    .banner
        .icons(
            v-if="showIcons"
            ref="icons"
            :style="{ opacity: iconOpacity }"
        )
            .icon(
                v-for="(source) in sources"
                :style="{ width: iconWidth, paddingLeft: iconPadding, paddingRight: iconPadding }"
            )
                img(
                    :src="source.icons[0]"
                    :alt="source.name"
                    :title="source.name"
                )
        .links
            a.link(
                href="/"
                target="_blank"
            ) HOME
            span &nbsp;&nbsp;
            span |
            span &nbsp;&nbsp;
            a.link(
                href="https://github.com/bubblesoft/kai-player"
                target="_blank"
            ) GITHUB
</template>

<script lang="ts">
    import { Component, Vue } from "vue-property-decorator";
    import { State } from "vuex-class";

    import config from "../config";

    import SourceGroup from "./source/SourceGroup";

    import { requestNetworkIdle } from "../scripts/utils";

    @Component
    export default class extends Vue {
        public $refs!: { icons: HTMLElement };
        private showIcons = false;
        @State((state) => state.generalModule.mode) private mode!: string;
        @State((state) => state.generalModule.preference || config.defaultPreference) private preference!: any;
        @State((state) => state.sourceModule.sourceGroup) private sourceGroup!: SourceGroup;

        get sources() {
            return this.sourceGroup.get(undefined);
        }

        get iconWidth() {
            if (!this.$refs.icons) {
                return 100 / this.sources.length + "%";
            }

            return this.$refs.icons.offsetWidth / this.sources.length + "px";
        }

        get iconPadding() {
            if (!this.$refs.icons) {
                return 100 / this.sources.length * .18 + "%";
            }

            return this.$refs.icons.offsetWidth / this.sources.length * .18 + "px";
        }

        get iconOpacity() {
            if (this.mode === "mobile" && this.preference.graphicEffect >= .6) {
                return .6;
            }

            return "initial";
        }

        private created() {
            requestNetworkIdle(() => {
                this.showIcons = true;
            });
        }
    }
</script>

<style lang="scss" scoped>
    .banner {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 20px;

        @media (max-width: 768px) {
            padding: 9px 16px;
        }

        @media (max-width: 372px) {
            padding: 9px 16px;
        }

        .icons {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            width: 35%;

            @media (max-width: 768px) {
                flex-grow: 1;
                width: auto;
            }

            .icon {
                flex-shrink: 1;

                img {
                    width: 100%;
                    height: auto;

                    @media (max-width: 768px) {
                        width: 100%;
                        height: auto;
                    }
                }

                @media (max-width: 372px) {
                    display: none;
                }
            }
        }

        .links {
            margin-left: 20px;

            @media (max-width: 768px) {
                margin-left: 15px;
            }

            .link {
                margin: 0;
                color: #fff;
                text-shadow: 0 0 20px #969696;
            }
        }
    }
</style>
