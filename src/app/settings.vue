<template lang="pug">
    modal.settings(
        v-model="value"
        :title="$t('Settings')"
        effect="zoom"
    )
        .modal-body(slot="modal-body")
            section
                div {{ $t('Source icon') }}
                div
                    prettyCheckbox.p-switch.p-slim(v-model="showSourceIcon")
            section
                div {{ $t('Background') }}
                div
                    button.btn.btn-default.btn-xs(
                        v-interact:tap="() => { showUploader = true; }"
                    ) {{ $t('Upload') }}
            section(:style="{ display: showUploader ? 'flex' : 'none' }")
                div
                filePond(
                    ref="pond"
                    :label-idle="this.$t('Drag & Drop you files or Browse')"
                    accepted-file-types="image/jpeg, image/png"
                    :server="pondServer"
                    @processfile="handleFileUploaded"
                )
            section
                div {{ $t('Language') }}
                div
                    select.form-control(v-model="locale")
                        option(
                            value=""
                            disabled
                        ) {{ $t('Select a language') }}
                        option(
                            v-for="{ name, value } of localeOptions"
                            :value="value"
                        ) {{ name }}
            section
                div {{ $t("Power control") }}
                div(style="display: flex; align-items: center; width: 50%; max-width: 200px; min-width: 160px;")
                    div(style="max-width: 42px;") {{ $t("Power Saving") }}
                    div(style="flex-grow: 1; margin: 0 5px;")
                        vue-slider.performance(
                            v-if="renderPerformanceOption"
                            v-model="performanceFactor"
                            :max="1"
                            :interval=".01"
                            tooltip="hover"
                            :lazy="true"
                            :formatter="(v) => `${(v * 100).toFixed(0)}`"
                            :bg-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)' }"
                            :slider-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)' }"
                            :process-style="{ 'background-color': 'rgba(255, 255, 255, 0.9)', filter: 'drop-shadow(2px 2px 10px rgba(150, 150, 150, 1))' }"
                            :tooltip-style="{ 'background-color': 'rgba(255, 255, 255, 0.6)', 'border-color': 'rgba(255, 255, 255, 0.6)', 'border-style': 'none' }"
                        )
                    div(style="max-width: 40px;")  {{ $t("Visual") }}
            section
                .text-danger {{ $t('Reset settings') }}
                div
                    button.btn.btn-danger.btn-xs(
                        v-interact:tap="() => { resetSettings(); }"
                    ) {{ $t('Reset') }}
        .modal-footer(slot="modal-footer")
            button.btn.btn-default.btn-sm(
                v-interact:tap="() => { $emit('input', false); showUploader = false; $refs.pond.removeFiles(); }"
                type="button"
            ) {{ $t('Close') }}
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    import vueFilePond from 'vue-filepond';
    import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.esm.js';
    import FilePondPluginImagePreview from 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.esm.js';
    import 'filepond/dist/filepond.css';
    import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

    import vueSlider from "vue-slider-component";
    import prettyCheckbox from "pretty-checkbox-vue/check";
    import modal from "vue-strap/src/modal";

    import { SET_BACKGROUND_IMAGE, SET_LOCALE, SET_SHOW_SOURCE_ICON, SET_PERFORMANCE_FACTOR } from "../scripts/mutation-types";

    import config from "../config";

    const filePond = vueFilePond(FilePondPluginFileValidateType, FilePondPluginImagePreview);


    export default {
        components: {
            vueSlider,
            prettyCheckbox,
            modal,
            filePond,
        },

        model: {
            prop: '_value'
        },

        props: {
            _value: Boolean
        },

        data() {
            return {
                renderPerformanceOption: false,
                showUploader: false,
                pondServer: {
                    url: '/upload/files',
                    revert: null,
                    restore: null,
                    load: null,
                    fetch: null
                },
                localeOptions: [
                    { name: "English", value: "en" },
                    { name: "English(US)", value: "en-US" },
                    { name: "中文", value: "zh" },
                    { name: "中文(简体)", value: "zh-CN" },
                    { name: "日本語", value: "ja" },
                    { name: "한국어", value: "ko" },
                ]
            }
        },

        computed: {
            value: {
                get() {
                    return this._value;
                },
                set(value) {
                    this.$emit('input', value);
                    this.showUploader = false;
                    this.$refs.pond.removeFiles();
                }
            },

            showSourceIcon: {
                get() {
                    return this.$store.state.generalModule.showSourceIcon;
                },
                set(showSourceIcon) {
                    this[SET_SHOW_SOURCE_ICON](showSourceIcon);
                }
            },

            locale: {
                get() {
                    const locale = this.$store.state.generalModule.locale;

                    if (/^ja/.test(locale)) {
                        return "ja";
                    }

                    if (/^ko/.test(locale)) {
                        return "ko";
                    }

                    if (!this.localeOptions.map(({ value }) => value).includes(locale)) {
                        return "en-US";
                    }

                    return locale;
                },
                set(locale) {
                    this[SET_LOCALE](locale);
                }
            },

            performanceFactor: {
                get() {
                    return this.preference.performanceFactor;
                },

                set(performanceFactor) {
                    this[SET_PERFORMANCE_FACTOR](performanceFactor);
                }
            },

            ...mapState({
                preference: (state) => state.generalModule.preference || config.defaultPreference,
            }),
        },

        methods: {
            async resetSettings() {
                try {
                    await this.$confirm({
                        title: this.$t('Confirm settings reset'),
                        bodyText: this.$t('Are you sure to reset all settings?'),
                        confirmText: this.$t('Confirm'),
                        cancelText: this.$t('Cancel')
                    });

                    localStorage.removeItem("kaiplayerlayoutdesktop");
                    localStorage.removeItem("kaiplayerlayoutmobile");
                    localStorage.removeItem("kaiplayerlocale");
                    localStorage.removeItem("kaiplayerbackgroundimage");
                    localStorage.removeItem("kaiplayershowsouceicon");
                    localStorage.removeItem("kaiplayerinitiated");
                    location.reload();
                } catch (e) { }
            },

            handleFileUploaded() {
                this[SET_BACKGROUND_IMAGE](JSON.parse(this.$refs.pond.getFiles()[0].serverId).data.filepond.url);
            },

            ...mapMutations([
                SET_BACKGROUND_IMAGE,
                SET_SHOW_SOURCE_ICON,
                SET_LOCALE,
                SET_PERFORMANCE_FACTOR,
            ])
        },

        watch: {
            value(to) {
                this.$emit('input', to);
            }
        },

        mounted() {
            setTimeout(() => this.renderPerformanceOption = true, 500);
        }
    }
</script>

<style lang="scss" scoped>
    section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 20px 0;

        .filepond--wrapper {
            width: 50%;
        }

        select {
            height: 24px;
            width: 100px;
            padding: 0;

            option {
                color: #000;
            }
        }
    }
</style>
