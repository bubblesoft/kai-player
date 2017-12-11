/**
 * Created by qhyang on 2017/12/1.
 */

import Vue from 'vue';
import Vuex from 'vuex';

import i18next from 'i18next';

import Player from './Player';
import App from './app';

if (!window["Promise"]) {
    window["Promise"] = require("promise-polyfill");
}

Vue.use(Vuex);

const lang = sessionStorage.getItem("locale") || window.navigator.language || "en-US";

i18next.init({
    lng: lang,
    debug: true,
    resources: {
        'en-US': {
            translation: {
                'Playlist': 'Playlist',
                'Panel': 'Panel'
            }
        },
        'zh-CN': {
            translation: {
                'Playlist': '播放列表',
                'Panel': '面板'
            }
        },
        'ja-JP': {
            translation: {
                'Playlist': 'プレーリスト',
                'Panel': 'パネル'
            }
        },
        'ko-KR': {
            translation: {
                'Playlist': '재생 목록',
                'Panel': '패널'
            }
        }
    }
});

const generalModule = {
    state: {
        i18n: i18next
    }
};

const playerModule = {
    state: {
        player: new Player
    }
};

const store = new Vuex.Store({
    modules: {
        generalModule,
        playerModule
    }
});

new Vue({
    el: 'app',
    store,
    render: (createElement) => createElement(App)
});

import '../styles/bootstrap';
import '../styles/base';