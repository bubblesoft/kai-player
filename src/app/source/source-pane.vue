<template lang="pug">
    .wrap
        div.list-group
            label.list-group-item(
                v-for="source in sources"
                href="javascript:;"
            )
                input(
                    v-model="source.active"
                    type="checkbox"
                )
                span {{ source.name }}

</template>

<script>
    import { mapState } from 'vuex';

    export default {
        computed: {
            sources() {
              return this.sourceGroup.get()
            },
            ...mapState({
                sourceGroup: state => state.sourceModule.sourceGroup,
            })
        }
    }
</script>

<style lang="scss" scoped>
    .wrap {
        height: 100%;
        background-color: rgba(255, 255, 255, .15);

        tr {
            cursor: default;
        }
    }
</style>