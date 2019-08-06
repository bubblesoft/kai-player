/**
 * Created by qhyang on 2017/12/1.
 */

import 'whatwg-fetch';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import 'url-polyfill';

import Vue from 'vue';

import VTooltip from "v-tooltip";
import VueConfirm from '../scripts/vue-confirm';

import interact from 'interactjs';

import '../styles/bootstrap';
import '../styles/base';
import '../styles/pretty-checkbox';
import '../styles/v-tooltip';

import { i18n, loadLocale } from './i18n';

import App from './app';

Vue.use(VTooltip);
Vue.use(VueConfirm);

(async () => {
    if (!window['Promise']) {
        window['Promise'] = await import('promise-polyfill');
    }

    const interactables = [];
    const bindingValues = [];

    Vue.directive('interact', {
        bind(el, bindings) {
            const interactable = interact(el);

            el.dataset.interactable = interactables.push(interactable) - 1;

            const bindingValueIndex = bindingValues.push(bindings.value) - 1;

            el.dataset.bindingValue = bindingValueIndex;

            switch (bindings.arg) {
                case 'doubletap':
                    interactable.on('doubletap', (e) => bindingValues[bindingValueIndex](e));
                    break;
                case 'tap':
                default:
                    interactable.on('tap', (e) => bindingValues[bindingValueIndex](e));
            }
        },
        update(el, bindings) {
            if (bindings.value === bindings.oldValue) {
                return;
            }

            const bindingValueIndex = +el.dataset.bindingValue;

            bindingValues[bindingValueIndex] = bindings.value;
        },
        unbind(el) {
            if (interactables[+el.dataset.interactable]) {
                interactables[+el.dataset.interactable].unset();
                delete interactables[+el.dataset.interactable];
            }

            if (bindingValues[+el.dataset.bindingValue]) {
                delete bindingValues[+el.dataset.bindingValue];
            }
        }
    });

    const locale = localStorage.getItem('kaiplayerlocale') || window.navigator.language || 'en-US';

    loadLocale(locale);

    const store = (await import('./store')).default;

    new Vue({
        el: 'app',
        store,
        i18n,
        render: createElement => createElement(App)
    });
})();
