/**
 * Created by qhyang on 2017/12/1.
 */

import 'whatwg-fetch';

import Vue from 'vue';
import Vuex from 'vuex';
import { VueHammer } from 'vue2-hammer'

import i18next from 'i18next';

import { UPDATE_QUEUE_GROUP, INSERT_QUEUE, UPDATE_QUEUE, UPDATE_PLAYING_QUEUE_INDEX, UPDATE_PANEL, UPDATE_ACTIVE_PANEL_INDEX, SET_ACTIVE_PANEL_INDEX_LOCK } from '../scripts/mutation-types';

import SourceGroup from './source/SourceGroup';
import QueueGroup from './queue/QueueGroup';
import Player from './Player';

import { ADD_SOURCES } from './mutation-types';

import App from './app';

if (!window["Promise"]) {
    window["Promise"] = require("promise-polyfill");
}

VueHammer.customEvents = {
    doubletap: {
        event: 'doubletap',
        type: 'tap',
        taps: 2
    }
};

Vue.use(Vuex);
Vue.use(VueHammer);

const lang = sessionStorage.getItem("locale") || window.navigator.language || "en-US";

i18next.init({
    lng: lang,
    debug: true,
    resources: {
        'en-US': {
            translation: {
                'Chart': 'Chart',
                'Media Source': 'Media Source',
                'Playlist': 'Playlist',
                'Tracks': 'Tracks',
                'Panel': 'Panel',
                'Search': 'Search',
                'Search for music': 'Search for music',
                'Temp': 'Temp',
                'New Playlist': 'New Playlist'
            }
        },
        'zh-CN': {
            translation: {
                'Chart': '排行榜',
                'Media Source': '媒体源',
                'Playlist': '播放列表',
                'Tracks': '播放音频',
                'Panel': '面板',
                'Search': '搜索',
                'Search for music': '搜索音乐',
                'Temp': '临时播放列表',
                'New Playlist': '新建播放列表'
            }
        },
        'ja-JP': {
            translation: {
                'Chart': 'Chart',
                'Media Source': 'Media Source',
                'Playlist': 'プレーリスト',
                'Tracks': 'Tracks',
                'Panel': 'パネル',
                'Search': 'Search',
                'Search for music': 'Search for music',
                'Temp': 'Temp',
                'New Playlist': 'New Playlist'
            }
        },
        'ko-KR': {
            translation: {
                'Chart': 'Chart',
                'Media Source': 'Media Source',
                'Playlist': '재생 목록',
                'Tracks': 'Tracks',
                'Panel': '패널',
                'Search': 'Search',
                'Search for music': 'Search for music',
                'Temp': 'Temp',
                'New Playlist': 'New Playlist'
            }
        }
    }
});

const generalModule = {
    state: {
        panels: {
            source: {
                open: true
            },
            list: {
                open: true
            },
            playlist: {
                open: true
            },
            tracks: {
                open: true
            },
            search: {
                open: true
            }
        },
        activePanel: {
            index: null,
            lock: false
        },
        i18next
    },
    mutations: {
        [UPDATE_PANEL] (state, { index, open }) {
            if (typeof open === 'boolean') {
                state.panels[index].open = open;
            }
        },
        [UPDATE_ACTIVE_PANEL_INDEX] (state, index) {
            state.activePanel.index = index;
        },
        [SET_ACTIVE_PANEL_INDEX_LOCK] (state, boolean) {
            state.activePanel.lock = boolean;
        }
    }
};

const sourceGroup = new SourceGroup({ name: 'Global' });

const sourceModule = {
    state: {
        sources: [],
        sourceGroup
    },
    mutations: {
        [ADD_SOURCES] (state, payload) {
            state.sources = payload;
        }
    }
};

const queueGroup = new QueueGroup({ name: 'Global' });

const queueModule = {
    state: {
        queueGroup,
        playingQueueIndex: null
    },
    mutations: {
        [UPDATE_QUEUE_GROUP] (state, { queues, active }) {
            queues && state.queueGroup.update(queues);

            if (typeof active === 'number') {
                state.queueGroup.active = active;
            }
        },
        [INSERT_QUEUE] (state, payload) {
            state.queueGroup.insert(payload.index, payload.queue);
        },
        [UPDATE_QUEUE] (state, { index, name, tracks, active }) {
            const queue = state.queueGroup.get(index);

            name && (queue.name = name);
            tracks && queue.update(tracks);

            if (typeof active === 'number') {
                queue.active = active;
            }
        },
        [UPDATE_PLAYING_QUEUE_INDEX] (state, { index }) {
            state.playingQueueIndex = index;
        }
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
        sourceModule,
        playerModule,
        queueModule
    }
});

(async ()=> {
    const sources = await sourceGroup.get();

    sources.forEach(source => {
        source.active = true;

        return source;
    });

    store.commit(ADD_SOURCES, sources);
})();

new Vue({
    el: 'app',
    store,
    render: (createElement) => createElement(App)
});

import '../styles/bootstrap';
import '../styles/base';
