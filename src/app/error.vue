<template lang="pug">
    .error
        div {{ $t('Error') }}
</template>

<script>
</script>

<style lang="scss" scoped>
    .error {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        text-shadow: 0 0 20px #969696;
    }
</style>