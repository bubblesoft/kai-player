<template lang="pug">
    .share
        section
            div(v-t="'Share as URL'")
            div
                button.btn.btn-default.btn-xs(
                    v-interact:tap="() => { writeTextToClipboard(); }"
                    v-t="'Copy URL'"
                    v-tooltip="{ content: $t('Copy successfully'), show: showCopyUrlTooltip, trigger: 'manual' }"
                )
</template>

<script lang="ts">
    import { Component, Prop, Vue, Watch } from "vue-property-decorator";
    import { State } from "vuex-class";

    import * as queryString from "querystring";

    import Track from "../Track";

    import { shorten, transformTrackForStringify } from "../../scripts/utils";

    @Component
    export default class extends Vue {
        @State((state) => state.visualizationModule.backgroundType) private backgroundType!: string;
        @State((state) => state.visualizationModule.visualizerType) private visualizerType!: string;
        @Prop() private input!: Track;
        private shortenUrlPromise!: Promise<string>;
        private showCopyUrlTooltip = false;
        private showCopyUrlTooltipTimout: number|null = null;

        private getUrl() {
            const trackData = JSON.stringify(transformTrackForStringify(this.input));

            return window.location.href.split("?")[0] + "?" + queryString.stringify({
                backgroundtype: this.backgroundType,
                track: trackData,
                visualizertype: this.visualizerType,
            });
        }

        private async writeTextToClipboard() {
            try {
                await navigator.clipboard.writeText(`${location.origin}/shorten/${await this.shortenUrlPromise}`);

                this.showCopyUrlTooltip = true;

                if (this.showCopyUrlTooltipTimout) {
                    clearTimeout(this.showCopyUrlTooltipTimout);
                }

                this.showCopyUrlTooltipTimout = setTimeout(() => {
                    this.showCopyUrlTooltipTimout = null;
                    this.showCopyUrlTooltip = false;
                }, 3000);
            } catch (e) {
                // console.log(e);
            }
        }

        private created() {
            this.shortenUrlPromise = shorten(this.getUrl());
        }

        @Watch("input")
        private onInputChanged() {
            this.shortenUrlPromise = shorten(this.getUrl());
        }
    }
</script>

<style lang="scss" scoped>
    section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 20px 0;
    }
</style>
