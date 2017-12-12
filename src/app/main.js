/**
 * Created by qhyang on 2017/12/1.
 */

import Vue from 'vue';
import Vuex from 'vuex';

import i18next from 'i18next';

import QueueGroup from './queue/QueueGroup';
import Queue from './queue/Queue';
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
                'Tracks': 'Tracks',
                'Panel': 'Panel'
            }
        },
        'zh-CN': {
            translation: {
                'Playlist': '播放列表',
                'Tracks': '播放音频',
                'Panel': '面板'
            }
        },
        'ja-JP': {
            translation: {
                'Playlist': 'プレーリスト',
                'Tracks': 'Tracks',
                'Panel': 'パネル'
            }
        },
        'ko-KR': {
            translation: {
                'Playlist': '재생 목록',
                'Tracks': 'Tracks',
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

const queueGroup = new QueueGroup({ name: 'Global' });

queueGroup.add(new Queue({ name: 'Temp' }));

// TODO: remove later
import Track from './queue/Track';
queueGroup
    .get(queueGroup.active)
    .add(new Track({
        src: require('../assets/46e1%2F6e85%2F8eba%2F2cadf8448f7aa4dba3fff1fd92e7b2fc.mp3'),
        title: 'test',
        length: 10000
    }))
    .add(new Track({
        src: require('../assets/46e1%2F6e85%2F8eba%2F2cadf8448f7aa4dba3fff1fd92e7b2fc.mp3'),
        title: 'test',
        length: 10000
    }))
    .add(new Track({
        src: require('../assets/46e1%2F6e85%2F8eba%2F2cadf8448f7aa4dba3fff1fd92e7b2fc.mp3'),
        title: 'test',
        length: 10000
    }))
    .add(new Track({
        src: require('../assets/46e1%2F6e85%2F8eba%2F2cadf8448f7aa4dba3fff1fd92e7b2fc.mp3'),
        title: 'test',
        length: 10000
    }))
    .add(new Track({
        src: require('../assets/46e1%2F6e85%2F8eba%2F2cadf8448f7aa4dba3fff1fd92e7b2fc.mp3'),
        title: 'test',
        length: 10000
    }))
    .add(new Track({
        src: require('../assets/46e1%2F6e85%2F8eba%2F2cadf8448f7aa4dba3fff1fd92e7b2fc.mp3'),
        title: 'test',
        length: 10000
    }));

const queueModule = {
    state: {
        queueGroup: queueGroup
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
        playerModule,
        queueModule
    }
});

new Vue({
    el: 'app',
    store,
    render: (createElement) => createElement(App)
});

import '../styles/bootstrap';
import '../styles/base';
