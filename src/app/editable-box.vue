<template lang="pug">
    .editable-cell(@click="focus") {{ text }}
        input(
            v-model="text"
            @change="change"
            @blur="blur"
            :style="inputStyle"
        )
</template>

<script>
    export default {
        props: {
          value: String
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
            change() {
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
        }
    }
</script>

<style lang="scss" scoped>
    .editable-cell {
        position: relative;

        input {
            display: block;
            position: absolute;
            left: 0;
            top: 0;
            font-size: 14px;
        }
    }
</style>