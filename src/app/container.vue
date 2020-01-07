<template lang="pug">
    .container
        app
        tips(
            v-if="renderTips"
            v-model="showTips"
        )
</template>

<script>
    import { mapActions } from "vuex";

    import { CLOSE_TIPS } from "../scripts/action-types";

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
            }),
        },

        data: () => ({
            renderTips: false,
            renderTipsTimeout: undefined,
        }),

        computed: {
            showTips: {
                get() {
                    return this.$store.state.generalModule.showTips;
                },

                set(value) {
                    if (!value) {
                        this[CLOSE_TIPS]();
                    }
                },
            }
        },

        methods: {
            ...mapActions([
                CLOSE_TIPS,
            ]),
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
        },
    };
</script>
