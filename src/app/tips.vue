<template lang="pug">
    modal.settings(
        v-model="show"
        :title="$t('Tips')"
        effect="zoom"
    )
        .modal-body(slot="modal-body")
            table.table-condensed.table.table-hover
                tr(v-for="(tip, index) in tips")
                    td(style="width:28px; padding: 5px 10px 5px 0; text-align: right; vertical-align: top;") {{ index + 1 }}.
                    td(style="padding: 5px 0;") {{ $t(tip) }}
        .modal-footer(slot="modal-footer")
            button.btn.btn-default.btn-sm(
                v-interact:tap="close"
                type="button"
            ) {{ $t('Close') }}
</template>

<script lang="ts">
    import Component from "vue-class-component";
    import { Prop, Vue } from "vue-property-decorator";

    import modal from "vue-strap/src/modal.vue";

    @Component({
        components: {
            modal,
        },
    })
    export default class extends Vue {
        @Prop(Boolean) private value!: boolean;

        get show() {
            return this.value;
        }

        set show(value) {
            this.$emit("input", value);
        }

        private tips = [
            "Panels are resizable/movable and can be closed/opened using the switches on the bottom control bar.",
            "Select the \"Listen Randomly\" playlist to start playing random tracks pushed by the app.",
            "Pick a visualization effect from the drop-down on the control bar.",
            "Detailed preference settings available via the gear icon on the control bar.",
            "More features are under development and will be added in feature releases.",
        ];

        private close() {
            this.$emit("input", false);
        }
    }
</script>

<style lang="scss" scoped>
    .modal-body {
        @media (min-width: 600px) {
            padding-right: 75px;
            padding-left: 75px;
        }
    }
</style>
