<template lang="pug">
    select.form-control(v-model="queue")
        option(
            value=""
            disabled
        ) {{ $t('Select a playlist') }}
        option(
            v-for="queue in queues"
            :value="queue"
        ) {{ queue.name }}
</template>

<script lang="ts">
    import { Component, Prop, Vue } from "vue-property-decorator";
    import { State } from "vuex-class";

    import modal from "vue-strap/src/modal.vue";

    import TrackQueue from "./queue/TrackQueue";

    @Component({
        components: {
            modal,
        },
    })
    export default class extends Vue {
        @State((state) => state.queueModule.queueGroup.get()) private queues!: TrackQueue[];
        @Prop() private value!: any;

        private get queue() {
            return this.value;
        }

        private set queue(value) {
            this.$emit("input", value);
        }

        private created() {
            this.queue = this.queues[0];
        }
    }
</script>

<style lang="scss" scoped>
    option {
        color: #000;
    }
</style>
