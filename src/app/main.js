/**
 * Created by qhyang on 2017/12/1.
 */

import 'whatwg-fetch';

import Vue from 'vue';
import Vuex from 'vuex';

import interact from 'interactjs';
import i18next from 'i18next';

import config from '../config';

import { UPDATE_QUEUE_GROUP, INSERT_QUEUE, UPDATE_QUEUE, UPDATE_PLAYING_QUEUE_INDEX, ADD_TRACK, UPDATE_ACTIVE_PANEL_INDEX, UPDATE_PANEL, SET_ACTIVE_PANEL_INDEX_LOCK } from '../scripts/mutation-types';

import SourceGroup from './source/SourceGroup';
import Source from './source/Source';
import Channel from './source/Channel';
import QueueGroup from './queue/QueueGroup';
import Queue from './queue/Queue';
import RandomQueue from './queue/RandomQueue';
import Player from './Player';

import { ADD_SOURCES } from './mutation-types';

import { getRecommendedTrack } from '../scripts/utils';

import App from './app';

if (!window["Promise"]) {
    window["Promise"] = require("promise-polyfill");
}

Vue.use(Vuex);

const interactables = [];

Vue.directive('interact', {
    bind(el, bindings) {
        const interactable = interact(el);

        el.dataset.interactable = interactables.push(interactable) - 1;

        switch (bindings.arg) {
            case 'doubletap':
                interactable.on('doubletap', bindings.value);
                break;
            case 'tap':
            default:
                interactable.on('tap', bindings.value);
                break;
        }
    },
    unbind(el) {
        interactables[+el.dataset.interactable].unset();
    }
});

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
                'New Playlist': 'New Playlist',
                'Listen Randomly': 'Listen Randomly',
                'Drag a track here and start random listening': 'Drag a track here and start random listening'
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
                'New Playlist': '新建播放列表',
                'Listen Randomly': '随便听听',
                'Drag a track here and start random listening': '拖动一个音频到这里开始收听'
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
                'New Playlist': 'New Playlist',
                'Listen Randomly': 'Listen Randomly',
                'Drag a track here and start random listening': 'Drag a track here and start random listening'
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
                'New Playlist': 'New Playlist',
                'Listen Randomly': 'Listen Randomly',
                'Drag a track here and start random listening': 'Drag a track here and start random listening'
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
        sourceGroup
    },
    mutations: {
        [ADD_SOURCES] (state, payload) {
            state.sourceGroup.add(...payload);
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
        [UPDATE_QUEUE_GROUP](state, { queues, active }) {
            queues && state.queueGroup.update(queues);

            if (typeof active === 'number') {
                state.queueGroup.active = active;
            }
        },

        [INSERT_QUEUE](state, { index, queue }) {
            state.queueGroup.insert(index, queue);
        },

        [UPDATE_QUEUE](state, { index, name, tracks, active }) {
            const queue = state.queueGroup.get(index);

            name && (queue.name = name);
            tracks && queue.update(tracks);

            if (typeof active === 'number') {
                queue.active = active;
            }
        },

        [UPDATE_PLAYING_QUEUE_INDEX](state, index) {
            state.playingQueueIndex = index;
        },

        [ADD_TRACK](state, track) {
            const queue = state.queueGroup.get(state.queueGroup.active);

            queue.active = queue.add(track);

            const active = state.queueGroup.active;
            state.queueGroup.active = null;
            state.queueGroup.active = active;
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

store.commit(INSERT_QUEUE, {
    index: 0,
    queue: new Queue({
        name: i18next.t('Temp')
    })
});

store.commit(INSERT_QUEUE, {
    index: 0,
    queue: new RandomQueue({
        name: i18next.t('Listen Randomly')
    })
});

store.commit(UPDATE_PLAYING_QUEUE_INDEX, 0);

(async () => {
    const sources = (await (await fetch(config.urlBase + '/audio/sources', {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })).json()).data.map(source => {
        const _source = new Source({
            id: source.id,
            name: source.name
        });

        source.channels.forEach(channel => {
            _source.add(new Channel({
                source: source.id,
                type: channel.type,
                name: channel.name
            }))
        });

        _source.active = true;

        return _source;
    });

    store.commit(ADD_SOURCES, sources);
    store.commit(ADD_TRACK, await getRecommendedTrack(null, sources));
})();

new Vue({
    el: 'app',
    store,
    render: createElement => createElement(App)
});

import '../styles/bootstrap';
import '../styles/base';
