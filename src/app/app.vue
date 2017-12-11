<template lang="pug">
    div.wrap
        control-bar
        play-list-pane(type="playlist")
</template>

<script>
    import controlBar from './control-bar';
    import playListPane from './pane-frame';

    export default {
        components: {
            controlBar,
            playListPane
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