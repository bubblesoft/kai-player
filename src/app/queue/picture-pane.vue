<template lang="pug">
    .picture-pane(:style="{ backgroundImage: `url(${track ? (track.picture && (/^\\/proxy\\/\\s*http:/.test(track.picture) ? track.picture : track.picture.replace(/^\\/proxy\\//, ''))) || getDefaultImage() : getDefaultImage()})` }")
</template>

<script lang="ts">
    import { Component, Vue } from "vue-property-decorator";
    import { State } from "vuex-class";

    import TrackQueue from "./TrackQueue";

    import { requestNetworkIdle } from "../../scripts/utils";

    import config from "../../config";

    @Component
    export default class extends Vue {
        @State((state) => state.queueModule.queueGroup.get(state.queueModule.playingQueueIndex || 0))
        private queue!: TrackQueue;
        private showImage = false;

        private get track() {
            return this.queue && this.queue.get(this.queue.activeIndex);
        }

        private getDefaultImage() {
            return config.defaultImages[Math.floor(config.defaultImages.length * Math.random())];
        }

        private created() {
            requestNetworkIdle(() => {
                this.showImage = true;
            });
        }
    }
</script>

<style lang="scss" scoped>
    .picture-pane {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
    }
</style>
