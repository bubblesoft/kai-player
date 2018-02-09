<template lang="pug">
    .app
        control-bar
        pane-frame(type="source")
        pane-frame(type="list")
        pane-frame(type="playlist")
        pane-frame(type="tracks")
        pane-frame(type="search")
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