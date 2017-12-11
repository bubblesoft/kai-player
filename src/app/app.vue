<template lang="pug">
    div.wrap
        control-bar
        pane-frame(type="playlist")
        pane-frame(type="tracks")
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
    .wrap {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }
</style>