<template lang="pug">
    .loading
        vueLoading(
            type="cylon"
            color="#fff"
        )
</template>

<script>
    import vueLoading from 'vue-loading-template';

    export default {
        components: {
            vueLoading
        }
    }
</script>

<style lang="scss" scoped>
    .loading {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;

        .vue-loading {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
        }
    }
</style>