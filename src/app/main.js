/**
 * Created by qhyang on 2017/12/1.
 */

import 'whatwg-fetch';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import 'url-polyfill';

import Vue from 'vue';
import Vuex from 'vuex';
import VueI18n from 'vue-i18n';

import VueConfirm from '../scripts/vue-confirm';

import interact from 'interactjs';

import '../styles/bootstrap';
import '../styles/base';
import '../styles/pretty-checkbox';

import { ADD_SOURCES, UPDATE_SOURCE, UPDATE_QUEUE_GROUP, INSERT_QUEUE, UPDATE_QUEUE, UPDATE_PLAYING_QUEUE_INDEX, ADD_TRACK, UPDATE_TRACK, UPDATE_ACTIVE_PANEL_INDEX, SET_MODE, LOAD_LAYOUT, SAVE_LAYOUT, SET_ACTIVE_PANEL_INDEX_LOCK, SET_BACKGROUND_IMAGE, SET_LOCALE, SET_SHOW_SOURCE_ICON, UPDATE_ACTIVE_BACKGROUND_TYPE, UPDATE_ACTIVE_VISUALIZER_TYPE, SWITCH_TO_BACKGROUND, SWITCH_TO_VISUALIZER, TRIGGER_BACKGROUND_EVENT, VISUALIZER_LISTEN_TO, BACKGROUND_LOAD_RESOURCE, VISUALIZER_LOAD_RESOURCE } from '../scripts/mutation-types';

import SourceGroup from './source/SourceGroup';
import QueueGroup from './queue/QueueGroup';
import PlayerController from './PlayerController';
import Queue from './queue/Queue';
import RandomQueue from './queue/RandomQueue';
import Track from './Track';
import Artist from './Artist';
import Player from './Player';
import { threeRenderer, histogramRenderer, electricArcRenderer, artworkRenderer } from './visualization/renderers/renderers';
import Background from './visualization/visual_controllers/Background';
import Visualizer from './visualization/visual_controllers/Visualizer';


import App from './app';

if (!window["Promise"]) {
    window["Promise"] = require("promise-polyfill");
}

Vue.use(Vuex);
Vue.use(VueI18n);
Vue.use(VueConfirm);

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
        }
    },
    update(el, bindings) {
        const interactable = interactables[+el.dataset.interactable];

        switch (bindings.arg) {
            case 'doubletap':
                interactable.off('doubletap');
                interactable.on('doubletap', bindings.value);
                break;
            case 'tap':
            default:
                interactable.off('tap');
                interactable.on('tap', bindings.value);
        }
    },
    unbind(el) {
        interactables[+el.dataset.interactable].unset();
    }
});

const messages = {
    'en-US': {
        'Confirm': 'Confirm',
        'Cancel': 'Cancel',
        'Close': 'Close',
        'Play': 'Play',
        'Select': 'Select',
        'Remove': 'Remove',
        'New': 'New',
        'Settings': 'Settings',
        'Add to playlist': 'Add to playlist',
        'Import all as a playlist': 'Import all as a playlist',
        'Chart': 'Chart',
        'Artwork': 'Artwork',
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
        'Select a media source': 'Select a media source',
        'Select a channel': 'Select a channel',
        'Unknown Artist': 'Unknown Artist',
        'Add to a playlist': 'Add to a playlist',
        'Move to...': 'Move to...',
        'Enter edit mode': 'Enter edit mode',
        'Exit edit mode': 'Exit edit mode',
        'Drag a track here to remove it': 'Drag a track here to remove it',
        'Drag a playlist here to remove it': 'Drag a playlist here to remove it',
        'Remove duplicated tracks': 'Remove duplicated tracks',
        'Remove duplicated tracks?': 'Remove duplicated tracks？',
        'Select a playlist': 'Select a playlist',
        'Remove the playlist?': 'Remove the playlist?',
        'Select a background': 'Select a background',
        'Select a visualizer': 'Select a visualizer',
        'Histogram': 'Histogram',
        'Tiles': 'Tiles',
        'Random': 'Random',
        'Source icon': 'Source icon',
        'Reset settings': 'Reset settings',
        'Reset': 'Reset',
        'Confirm settings reset': 'Confirm settings reset',
        'Are you sure to reset all settings?': 'Are you sure to reset all settings?',
        'Background': 'Background',
        'Upload': 'Upload',
        'Language': 'Language',
        'Drag & Drop you files or Browse': 'Drag & Drop you files or Browse',
        'Select a language': 'Select a language',
        'Electric Arc': 'Electric Arc'
    },
    'zh-CN': {
        'Confirm': '确认',
        'Cancel': '取消',
        'Close': '关闭',
        'Play': '播放',
        'Select': '选择',
        'Remove': '删除',
        'New': '新建',
        'Settings': '设置',
        'Add to playlist': '添加到播放列表',
        'Import all as a playlist': '导入全部为播放列表',
        'Chart': '排行榜',
        'Artwork': '图片',
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
        'Select a media source': '选择媒体源',
        'Select a channel': '选择频道',
        'Unknown Artist': '未知艺术家',
        'Add to a playlist': '添加到播放列表',
        'Move to...': '移动到...',
        'Enter edit mode': '进入编辑模式',
        'Exit edit mode': '退出编辑模式',
        'Drag a track here to remove it': '拖动一个音频到这里删除',
        'Drag a playlist here to remove it': '拖动一个播放列表到这里删除',
        'Remove duplicated tracks': '删除重复项',
        'Remove duplicated tracks?': '确定删除重复项目？',
        'Select a playlist': '选择播放列表',
        'Remove the playlist?': '确定删除播放列表?',
        'Select a background': '选择背景',
        'Select a visualizer': '选择可视化',
        'Histogram': '直方图',
        'Tiles': '方块',
        'Random': '随机',
        'Source icon': '显示音频源图标',
        'Reset settings': '恢复初始设置',
        'Reset': '重置',
        'Confirm settings reset': '确定恢复初始设置',
        'Are you sure to reset all settings?': '确定要重置所有设置?',
        'Background': '背景',
        'Upload': '上传图片',
        'Language': '语言',
        'Drag & Drop you files or Browse': '拖动文件到这里或者点击浏览文件',
        'Select a language': '选择语言',
        'Electric Arc': '电弧'
    },
    'ja-JP': {
        'Confirm': 'はい',
        'Cancel': 'いいえ',
        'Close': '閉じる',
        'Play': '再生',
        'Select': '選択',
        'Remove': '削除',
        'New': '新規作成',
        'Settings': '设置',
        'Add to playlist': 'プレーリストに追加',
        'Import all as a playlist': '全部を新規プレーリストに',
        'Chart': 'ランキング',
        'Artwork': 'アートワーク',
        'Media Source': '媒体源',
        'Playlist': 'プレーリスト一覧',
        'Tracks': 'プレーリスト',
        'Panel': 'パネル',
        'Search': '検索',
        'Search for music': '音楽検索',
        'Temp': '臨時プレーリスト',
        'New Playlist': '新規プレーリスト',
        'Listen Randomly': 'ランダムに',
        'Drag a track here and start random listening': 'Drag a track here and start random listening',
        'Select a media source': 'Select a media source',
        'Select a channel': 'Select a channel',
        'Unknown Artist': 'Unknown Artist',
        'Add to a playlist': 'Add to a playlist',
        'Move to...': 'Move to...',
        'Enter edit mode': 'Enter edit mode',
        'Exit edit mode': 'Exit edit mode',
        'Drag a track here to remove it': 'Drag a track here to remove it',
        'Drag a playlist here to remove it': 'Drag a playlist here to remove it',
        'Remove duplicated tracks': 'Remove duplicated tracks',
        'Remove duplicated tracks?': 'Remove duplicated tracks？',
        'Select a playlist': 'プレーリスト選択',
        'Remove the playlist?': 'Remove the playlist?',
        'Select a background': 'Select a background',
        'Select a visualizer': 'Select a visualizer',
        'Histogram': 'Histogram',
        'Tiles': 'Tiles',
        'Random': 'Random',
        'Source icon': 'Source icon',
        'Reset settings': 'Reset settings',
        'Reset': 'Reset',
        'Confirm settings reset': 'Confirm settings reset',
        'Are you sure to reset all settings?': 'Are you sure to reset all settings?',
        'Background': 'Background',
        'Upload': 'Upload',
        'Language': 'Language',
        'Drag & Drop you files or Browse': 'Drag & Drop you files or Browse',
        'Select a language': 'Select a language',
        'Electric Arc': 'Electric Arc'
    },
    'ko-KR': {
        'Confirm': '네',
        'Cancel': '아니',
        'Close': '닫는다',
        'Play': '재생',
        'Select': '선택',
        'Remove': '삭제',
        'New': '신규작성',
        'Settings': 'Settings',
        'Add to playlist': 'Add to playlist',
        'Import all as a playlist': 'Import all as a playlist',
        'Chart': 'Chart',
        'Artwork': 'Artwork',
        'Media Source': 'Media Source',
        'Playlist': '재생목록 일람',
        'Tracks': '재생목록',
        'Panel': '패널',
        'Search': 'Search',
        'Search for music': 'Search for music',
        'Temp': 'Temp',
        'New Playlist': 'New Playlist',
        'Listen Randomly': 'Listen Randomly',
        'Drag a track here and start random listening': 'Drag a track here and start random listening',
        'Select a media source': 'Select a media source',
        'Select a channel': 'Select a channel',
        'Unknown Artist': 'Unknown Artist',
        'Add to a playlist': 'Add to a playlist',
        'Move to...': 'Move to...',
        'Enter edit mode': 'Enter edit mode',
        'Exit edit mode': 'Exit edit mode',
        'Drag a track here to remove it': 'Drag a track here to remove it',
        'Drag a playlist here to remove it': 'Drag a playlist here to remove it',
        'Remove duplicated tracks': 'Remove duplicated tracks',
        'Remove duplicated tracks?': 'Remove duplicated tracks？',
        'Select a playlist': 'Select a playlist',
        'Remove the playlist?': 'Remove the playlist?',
        'Select a background': 'Select a background',
        'Select a visualizer': 'Select a visualizer',
        'Histogram': 'Histogram',
        'Tiles': 'Tiles',
        'Random': 'Random',
        'Source icon': 'Source icon',
        'Reset settings': 'Reset settings',
        'Reset': 'Reset',
        'Confirm settings reset': 'Confirm settings reset',
        'Are you sure to reset all settings?': 'Are you sure to reset all settings?',
        'Background': 'Background',
        'Upload': 'Upload',
        'Language': 'Language',
        'Drag & Drop you files or Browse': 'Drag & Drop you files or Browse',
        'Select a language': 'Select a language',
        'Electric Arc': 'Electric Arc'
    }
};

const locale = localStorage.getItem('kaiplayerlocale') || window.navigator.language || 'en-US';

const i18n = new VueI18n({
    locale,
    messages
});

const generalModule = {
    state: {
        activePanel: {
            index: null,
            lock: false
        },
        mode: null,
        layout: null,
        backgroundImage: localStorage.getItem('kaiplayerbackgroundimage') || 'http://bubblesoft.oss-ap-southeast-1.aliyuncs.com/1d69083104fb0c7d0e3a568d72f3eff8_numendil-333089-unsplash.jpg',
        showSourceIcon: (() => {
            const showSourceIcon = localStorage.getItem('kaiplayershowsouceicon');

            return showSourceIcon ? Boolean(+showSourceIcon) : true;
        })(),
        locale
    },

    mutations: {
        [UPDATE_ACTIVE_PANEL_INDEX] (state, index) {
            state.activePanel.index = index;
        },
        [SET_ACTIVE_PANEL_INDEX_LOCK] (state, boolean) {
            state.activePanel.lock = boolean;
        },
        [SET_MODE] (state, mode) {
            state.mode = mode;
        },
        [LOAD_LAYOUT] (state, layout) {
            state.layout = layout;
        },
        [SAVE_LAYOUT] (state, { index, layout }) {
            state.layout[index] = layout;
            localStorage.setItem('kaiplayerlayout' + state.mode, JSON.stringify(state.layout));
        },
        [SET_BACKGROUND_IMAGE] (state, url) {
            state.backgroundImage = url;
            localStorage.setItem('kaiplayerbackgroundimage', url);
        },
        [SET_LOCALE] (state, locale) {
            i18n.locale = locale;
            state.locale = locale;
            localStorage.setItem('kaiplayerlocale', locale);
        },
        [SET_SHOW_SOURCE_ICON] (state, showSourceIcon) {
            state.showSourceIcon = showSourceIcon;
            localStorage.setItem('kaiplayershowsouceicon', Number(showSourceIcon));
        }
    }
};

const sourceGroup = new SourceGroup({ name: 'Global' });

const sourceModule = {
    state: {
        sourceGroup
    },
    mutations: {
        [ADD_SOURCES] (state, sources) {
            state.sourceGroup.add(...sources);
        },
        [UPDATE_SOURCE] (state, { index, active }) {
            state.sourceGroup.get(index).active = active;
            localStorage.setItem('kaiplayersourceactive', JSON.stringify((() => {
                const data = {};

                state.sourceGroup.get().forEach(source => {
                   data[source.id] = source.active;
                });

                return data;
            })()))
        }
    }
};

const saveQueueData = (queueGroup, playingQueueIndex) => {
        localStorage.setItem('kaiplayerplayingqueues', JSON.stringify({
            queues: queueGroup.get().map(queue => {
                return {
                    type: (() => {
                        switch (queue.constructor) {
                            case RandomQueue:
                                return 'random';

                            case Queue:
                            default:
                                return 'basic';
                        }
                    })(),
                    name: queue.name,
                    tracks: queue.get().map(track => {
                        return {
                            id: track.id,
                            name: track.name,
                            duration: track.duration,
                            artists: track.artists.map(artist => {
                                return {
                                    name: artist.name
                                }
                            }),
                            picture: track.picture
                        }
                    }),
                    active: queue.active
                }
            }),
            active: queueGroup.active,
            playing: playingQueueIndex
        }));
    },

    restoreQueueData = () => {
        const queueGroup = new QueueGroup({ name: 'Global' });

        let playingQueueIndex = null;

        const queueGroupData = JSON.parse(localStorage.getItem('kaiplayerplayingqueues'));

        if (queueGroupData && queueGroupData.queues.length) {
            queueGroup.add(...queueGroupData.queues.map(queueData => {
                const queue = (() => {
                    switch (queueData.type) {
                        case 'random':
                            return new RandomQueue({ name: queueData.name });

                        case 'basic':
                        default:
                            return new Queue({ name: queueData.name });
                    }
                })();

                queue.active = queueData.active;

                if (queueData.tracks.length) {
                    queue.add(...queueData.tracks.map(trackData => {
                        return new Track({
                            id: trackData.id,
                            name: trackData.name,
                            duration: trackData.duration,
                            artists: trackData.artists.map(artistData => {
                                return new Artist({
                                    name: artistData.name
                                })
                            }),
                            picture: trackData.picture
                        });
                    }));
                }

                return queue;
            }));

            queueGroup.active = queueGroupData.active;
            playingQueueIndex = queueGroupData.playing;
        }

        return {
            queueGroup,
            playingQueueIndex
        }
    };

const queueData = restoreQueueData();

const queueModule = {
    state: {
        queueGroup: queueData.queueGroup,
        playingQueueIndex: queueData.playingQueueIndex
    },
    mutations: {
        [UPDATE_QUEUE_GROUP](state, { queues, active }) {
            queues && state.queueGroup.update(queues);

            if (typeof active === 'number') {
                state.queueGroup.active = active;
            }

            saveQueueData(state.queueGroup, state.playingQueueIndex);
        },

        [INSERT_QUEUE](state, { index, queue }) {
            state.queueGroup.insert(index, queue);
            saveQueueData(state.queueGroup, state.playingQueueIndex);
        },

        [UPDATE_QUEUE](state, { index, name, tracks, active }) {
            const queue = state.queueGroup.get(index);

            name && (queue.name = name);
            tracks && queue.update(tracks);

            if (typeof active === 'number' || active === null) {
                queue.active = active;
            }

            saveQueueData(state.queueGroup, state.playingQueueIndex);
        },

        [UPDATE_PLAYING_QUEUE_INDEX](state, index) {
            state.playingQueueIndex = index;
            saveQueueData(state.queueGroup, state.playingQueueIndex);
        },

        [ADD_TRACK](state, { track, queue = state.queueGroup.get(state.queueGroup.active) }) {
            queue.active = queue.add(track);

            const active = state.queueGroup.active;

            state.queueGroup.active = null;
            state.queueGroup.active = active;
            saveQueueData(state.queueGroup, state.playingQueueIndex);
        },

        [UPDATE_TRACK](state, { index, duration, queue = state.queueGroup.get(state.queueGroup.active) }) {
            if (duration) {
                queue.get(index).duration = duration;
                saveQueueData(state.queueGroup, state.playingQueueIndex);
            }
        }
    }
};

const playerController = new PlayerController;

playerController.connect(new Player);

const playerModule = {
    state: {
        playerController
    }
};

const visualizationModule = {
    state: {
        background: new Background( localStorage.getItem('kaisoftbackgroundtype') || 'three'),
        visualizer: new Visualizer(localStorage.getItem('kaisoftvisualizertype') || 'random')
    },
    mutations: {
        [UPDATE_ACTIVE_BACKGROUND_TYPE](state, type) {
            const previousRenderer = state.background.activeRenderer,
                playing = playerModule.state.playerController.player ? playerModule.state.playerController.player.playing : false;

            state.background.activeType = type;

            const background = state.background;

            if (!playing && background.activeRenderer !== previousRenderer) {
                previousRenderer.hide();
                previousRenderer.pause();
                background.activeRenderer.start();
                background.activeRenderer.show();
            }

            state.background = null;
            state.background = background;
            localStorage.setItem('kaisoftbackgroundtype', type);
        },

        [UPDATE_ACTIVE_VISUALIZER_TYPE](state, type) {
            const previousRenderer = state.visualizer.activeRenderer,
                playing = playerModule.state.playerController.player.playing;

            state.visualizer.activeType = type;

            const visualizer = state.visualizer;

            if (playing && visualizer.activeRenderer !== previousRenderer) {
                previousRenderer.hide();
                previousRenderer.pause();
                visualizer.activeRenderer.start();
                visualizer.activeRenderer.show();
            }

            state.visualizer = null;
            state.visualizer = visualizer;
            localStorage.setItem('kaisoftvisualizertype', type);
        },

        [SWITCH_TO_BACKGROUND](state) {
            if (state.background.activeRenderer !== state.visualizer.activeRenderer) {
                state.visualizer.activeRenderer.hide();
                state.background.activeRenderer.start();
                state.background.start();
                state.background.activeRenderer.show();
                state.visualizer.stop();
                state.visualizer.activeRenderer.pause();
            } else {
                state.visualizer.stop();
                state.background.start();
            }
        },

        async [SWITCH_TO_VISUALIZER](state) {
            if (state.background.activeRenderer !== state.visualizer.activeRenderer) {
                await state.background.event('play');
                state.background.activeRenderer.hide();
                state.visualizer.activeRenderer.start();
                state.visualizer.start();
                state.visualizer.activeRenderer.show();
                state.background.stop();
                state.background.activeRenderer.pause();
                state.background.event('reset');
            } else {
                state.background.stop();
                state.visualizer.start();
            }
        },

        [TRIGGER_BACKGROUND_EVENT](state, type) {
            state.background.event(type);
        },

        [VISUALIZER_LISTEN_TO](state, audioSource) {
            state.visualizer.listen(audioSource);
        },

        [BACKGROUND_LOAD_RESOURCE](state, { picture } = {}) {
            state.background.loadResource({ picture });
        },

        [VISUALIZER_LOAD_RESOURCE](state, { picture } = {}) {
            state.visualizer.loadResource({ picture });
        }
    },
    actions: {
        initVisualization(context, mountPoint) {
            threeRenderer.init(mountPoint);
            histogramRenderer.init(mountPoint);
            electricArcRenderer.init(mountPoint);
            artworkRenderer.init(mountPoint);
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
    i18n,
    render: createElement => createElement(App)
});
