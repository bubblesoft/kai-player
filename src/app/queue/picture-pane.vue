<template lang="pug">
    .picture-pane(:style="{ backgroundImage: `url(${track ? track.picture || '' : ''})` }")
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        computed: {
            track() {
                return this.queue && this.queue.get(this.queue.activeIndex);
            },

            ...mapState({
                queue: state => state.queueModule.queueGroup.get(state.queueModule.playingQueueIndex || 0),
            })
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