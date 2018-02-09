<template lang="pug">
    .app
        control-bar
        paneFrame(type="playlist")
</template>

<script>
    import controlBar from './control-bar';
    import paneFrame from './pane-frame';

    export default {
        components: {
            controlBar,
            paneFrame
        }
    }
</script>

<style lang="scss" scoped>
    .app {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }
</style>