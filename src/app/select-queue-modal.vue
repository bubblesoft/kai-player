<template lang="pug">
    modal.settings(
        v-model="value"
        small
        :title="$t('Select a playlist')"
        effect="zoom"
    )
        .modal-body(slot="modal-body")
            select.form-control(v-model="queue")
                option(
                    value=""
                    disabled
                ) {{ $t('Select a playlist') }}
                option(
                    v-for="queue in queues"
                    :value="queue"
                ) {{ queue.name }}
        .modal-footer(slot="modal-footer")
            button.btn.btn-primary.btn-sm(
                v-interact:tap="() => { callback(queue); $emit('input', false)  }"
                type="button"
            ) {{ $t('Confirm') }}
            button.btn.btn-default.btn-sm(
                v-interact:tap="() => { $emit('input', false);  }"
                type="button"
            ) {{ $t('Cancel') }}
</template>

<script>
    import { mapState } from 'vuex';

    import RandomQueue from './queue/RandomQueue';

    import modal from 'vue-strap/src/modal';

    export default {
        components: {
            modal
        },

        model: {
            prop: '_value'
        },

        props: {
            _value: Boolean,
            callback: Function
        },

        data() {
            return {
                queue: null
            }
        },

        computed: {
            value: {
                get() {
                    return this._value;
                },
                set(value) {
                    this.$emit('input', value);
                    this.queue = this.queues[0];
                }
            },

            ...mapState({
                queues: state => state.queueModule.queueGroup.get().filter(queue => queue.constructor !== RandomQueue),
            })
        },

        created() {
            this.queue = this.queues[0];
        }
    }
</script>

<style lang="scss" scoped>
    option {
        color: #000;
    }
</style>