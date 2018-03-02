/**
 * Created by qhyang on 2017/12/1.
 */

import 'whatwg-fetch';

import Vue from 'vue';
import Vuex from 'vuex';
import VueI18n from 'vue-i18n';

import interact from 'interactjs';

import { ADD_SOURCES, UPDATE_QUEUE_GROUP, INSERT_QUEUE, UPDATE_QUEUE, UPDATE_PLAYING_QUEUE_INDEX, ADD_TRACK, UPDATE_PANEL, UPDATE_ACTIVE_PANEL_INDEX, SET_ACTIVE_PANEL_INDEX_LOCK, UPDATE_ACTIVE_BACKGROUND_TYPE, SWITCH_TO_VISUALIZER, SWITCH_TO_BACKGROUND, TRIGGER_BACKGROUND_EVENT } from '../scripts/mutation-types';

import SourceGroup from './source/SourceGroup';
import QueueGroup from './queue/QueueGroup';
import Player from './Player';
import { threeRenderer, histogramRenderer } from './visualization/renderers/renderers';
import Background from './visualization/visual_controllers/Background';
import Visualizer from './visualization/visual_controllers/Visualizer';

import app from './app';

if (!window["Promise"]) {
    window["Promise"] = require("promise-polyfill");
}

Vue.use(Vuex);
Vue.use(VueI18n);

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

const messages = {
    'en-US': {
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
        'Drag a track here and start random listening': 'Drag a track here and start random listening',
        'Unknown Artist': 'Unknown Artist'
    },
    'zh-CN': {
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
        'Drag a track here and start random listening': '拖动一个音频到这里开始收听',
        'Unknown Artist': '未知艺术家'
    },
    'ja-JP': {
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
        'Drag a track here and start random listening': 'Drag a track here and start random listening',
        'Unknown Artist': 'Unknown Artist'
    },
    'ko-KR': {
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
        'Drag a track here and start random listening': 'Drag a track here and start random listening',
        'Unknown Artist': 'Unknown Artist'
    }
};

const lang = sessionStorage.getItem("locale") || window.navigator.language || "en-US";

const i18n = new VueI18n({
    locale: lang,
    messages
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
        }
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

const visualizationModule = {
    state: {
        background: new Background('three'),
        visualizer: new Visualizer('histogram')
    },
    mutations: {
        [UPDATE_ACTIVE_BACKGROUND_TYPE](state, type) {
            state.background.activeType = type;
        },
        [SWITCH_TO_BACKGROUND](state) {
            if (state.background.activeType !== state.visualizer.activeType) {
                state.visualizer.stop();
                state.background.start();
            }
        },
        [SWITCH_TO_VISUALIZER](state, audioSource) {
            if (state.background.activeType !== state.visualizer.activeType) {
                state.background.stop();
                state.visualizer.start();
            }

            state.visualizer.listen(audioSource);
        },
        [TRIGGER_BACKGROUND_EVENT](state, type) {
            state.background.event(type);
        }
    },
    actions: {
        initVisualization(context, mountPoint) {
            threeRenderer.init(mountPoint);
            histogramRenderer.init(mountPoint);
        }
    }
};

const store = new Vuex.Store({
    modules: {
        generalModule,
        sourceModule,
        queueModule,
        playerModule,
        visualizationModule
    }
});

new Vue({
    el: 'app',
    store,
    render: createElement => createElement(app)
});

import '../styles/bootstrap';
import '../styles/base';
