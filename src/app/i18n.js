import Vue from 'vue';
import VueI18n from "vue-i18n";

import defaultLocaleData from '../i18n/en-US';

Vue.use(VueI18n);

const LOCALES = ['en-US', 'zh-CN', 'ja-JP', 'ko-KR'],
    DEFAULT_LOCALE = LOCALES[0];

const i18n = new VueI18n({
    locale: DEFAULT_LOCALE,
    fallbackLocale: DEFAULT_LOCALE,
    messages: { [DEFAULT_LOCALE]: defaultLocaleData.messages }
});

const loadedLanguages = [LOCALES[0]];

const setI18nLanguage = (locale) => {
    i18n.locale = locale;
    document.querySelector('html').setAttribute('lang', locale);

    return locale;
};

const loadLocale = async (locale) => {
    if (i18n.locale !== locale) {
        if (!loadedLanguages.includes(locale)) {
            i18n.setLocaleMessage(locale, (await import(`../i18n/${locale}`)).messages);
            loadedLanguages.push(locale);

            return setI18nLanguage(locale);
        }

        return setI18nLanguage(locale);
    }
};

export { i18n, loadLocale };
