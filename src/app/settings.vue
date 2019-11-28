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
    import { mapMutations } from 'vuex';

    import { SET_BACKGROUND_IMAGE, SET_LOCALE, SET_SHOW_SOURCE_ICON } from '../scripts/mutation-types';

    import prettyCheckbox from 'pretty-checkbox-vue/check';

    import modal from 'vue-strap/src/modal';

    import vueFilePond from 'vue-filepond';
    import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.esm.js';
    import FilePondPluginImagePreview from 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.esm.js';
    import 'filepond/dist/filepond.css';
    import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

    const filePond = vueFilePond(FilePondPluginFileValidateType, FilePondPluginImagePreview);


    export default {
        components: {
            prettyCheckbox,
            modal,
            filePond
        },

        model: {
            prop: '_value'
        },

        props: {
            _value: Boolean
        },

        data() {
            return {
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
            }
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

                    localStorage.removeItem('kaiplayerlayoutdesktop');
                    localStorage.removeItem('kaiplayerlayoutmobile');
                    localStorage.removeItem('kaiplayerlocale');
                    localStorage.removeItem('kaiplayerbackgroundimage');
                    localStorage.removeItem('kaiplayershowsouceicon');
                    location.reload();
                } catch (e) { }
            },

            handleFileUploaded() {
                this[SET_BACKGROUND_IMAGE](JSON.parse(this.$refs.pond.getFiles()[0].serverId).data.filepond.url);
            },

            ...mapMutations([
                SET_BACKGROUND_IMAGE,
                SET_SHOW_SOURCE_ICON,
                SET_LOCALE
            ])
        },

        watch: {
            value(to) {
                this.$emit('input', to);
            }
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
