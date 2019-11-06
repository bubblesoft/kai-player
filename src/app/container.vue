<template lang="pug">
    .container
        app
        tips(
            v-if="renderTips"
            v-model="showTips"
        )
</template>

<script>
    import { mapState } from "vuex";

    import loading from "./loading";
    import error from "./error";
    import tips from "./tips";

    export default {
        components: {
            tips,

            app: () => ({
                component: import("./app"),
                loading,
                error,
                timeout: 30000,
            }),
        },

        data: () => ({
            renderTips: false,
            renderTipsTimeout: undefined,
        }),

        computed: {
            ...mapState({
                showTips: (state) => state.generalModule.showTips,
            })
        },

        watch: {
            showTips(showTips) {
                if (this.renderTipsTimeout) {
                    clearTimeout(this.renderTipsTimeout);
                    delete this.renderTipsTimeout;
                }

                if (showTips === true) {
                    return this.renderTips = true;
                } else if (showTips === false) {
                    this.renderTipsTimeout = setTimeout(() => {
                        delete this.renderTipsTimeout;
                        this.renderTips = false;
                    }, 2000);
                }
            },
        },

        created() {
            if (this.showTips === true) {
                this.renderTips = true;
            }
        }
    };
</script>

<style lang="scss" scoped>

</style>
