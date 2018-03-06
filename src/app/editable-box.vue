<template lang="pug">
    .editable-box(
        :style="{ height: this.height ? this.height + 'px' : 'auto', lineHeight: this.height ? this.height + 'px' : 'unset' }"
        v-interact:doubletap="focus"
    ) {{ value }}
        input(
            v-model="text"
            @input="input"
            @blur="blur"
            :style="inputStyle"
            @pointerdown.stop=""
            @mousedown.stop=""
        )
</template>

<script>
    export default {
        props: {
            value: String,
            height: Number
        },
        data() {
            return {
                text: '',
                inputStyle: {
                    display: 'none',
                    width: 0,
                    height: 0
                }
            }
        },
        methods: {
            input() {
                this.$emit('input', this.text);
            },
            focus() {
                this.inputStyle.width = this.$el.offsetWidth + 'px';
                this.inputStyle.height = this.$el.offsetHeight + 'px';
                this.inputStyle.display = 'block';
                setTimeout(() => {
                    this.$el.querySelector('input').focus();
                }, 0);
            },
            blur() {
                this.inputStyle.display = 'none';
            }
        },
        created() {
            this.text = this.value;
        },
        updated() {
            this.text = this.value;
        }
    }
</script>

<style lang="scss" scoped>
    .editable-box {
        position: relative;
        overflow: hidden;

        input {
            display: block;
            position: absolute;
            left: 0;
            top: 0;
            color: #333;
            font-size: 14px;
        }
    }
</style>