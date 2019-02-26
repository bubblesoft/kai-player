/**
 * Created by qhyang on 2017/12/1.
 */

import Promise from 'promise-polyfill';
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

import * as mutationTypes from '../scripts/mutation-types';

import SourceGroup from './source/SourceGroup';
import QueueGroup from './queue/QueueGroup';
import PlayerController from './PlayerController';
import Queue from './queue/Queue';
import RandomQueue from './queue/RandomQueue';
import Track from './Track';
import Artist from './Artist';
import Player from './Player';
import Background from './visualization/visual_controllers/Background';
import Visualizer from './visualization/visual_controllers/Visualizer';

import { generateLayout } from '../scripts/utils';

import App from './app';

if (!window['Promise']) {
    window['Promise'] = Promise;
}

Vue.use(Vuex);
Vue.use(VueI18n);
Vue.use(VueConfirm);

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
                interactable.on('doubletap', () => bindingValues[bindingValueIndex]());
                break;
            case 'tap':
            default:
                interactable.on('tap', () => bindingValues[bindingValueIndex]());
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

const messages = {
    'en-US': {
        'Error': 'Error',
        'Confirm': 'Confirm',
        'Cancel': 'Cancel',
        'Close': 'Close',
        'Play': 'Play',
        'Repeat all': 'Repeat all',
        'Repeat one': 'Repeat one',
        'Shuffle': 'Shuffle',
        'Move up': 'Move up',
        'Move down': 'Move down',
        'Select': 'Select',
        'Remove': 'Remove',
        'New': 'New',
        'Settings': 'Settings',
        'Confirm Action': 'Confirm Action',
        'Add to playlist': 'Add to playlist',
        'Import all as a playlist': 'Import all as a playlist',
        'Chart': 'Chart',
        'Artwork': 'Artwork',
        'Media Source': 'Media Source',
        'Playlist': 'Playlist',
        'Tracks': 'Tracks',
        'Panel': 'Panel',
        'Search': 'Search',
        'Lock the panel': 'Lock the panel',
        'Unlock the panel': 'Unlock the panel',
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
        'Electric Arc': 'Electric Arc',
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
        'Select a language': 'Select a language'
    },
    'zh-CN': {
        'Error': '错误',
        'Confirm': '确认',
        'Cancel': '取消',
        'Close': '关闭',
        'Play': '播放',
        'Repeat all': '全部循环',
        'Repeat one': '单曲循环',
        'Shuffle': '随机',
        'Move up': '上移',
        'Move down': '下移',
        'Select': '选择',
        'Remove': '删除',
        'New': '新建',
        'Settings': '设置',
        'Confirm Action': '确认',
        'Add to playlist': '添加到播放列表',
        'Import all as a playlist': '导入全部为播放列表',
        'Chart': '排行榜',
        'Artwork': '图片',
        'Media Source': '媒体源',
        'Playlist': '播放列表',
        'Tracks': '播放音频',
        'Panel': '面板',
        'Search': '搜索',
        'Lock the panel': '锁定面板',
        'Unlock the panel': '解锁面板',
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
        'Electric Arc': '电弧',
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
        'Select a language': '选择语言'
    },
    'ja-JP': {
        'Error': 'エラー',
        'Confirm': '確認',
        'Cancel': 'キャンセル',
        'Close': '閉じる',
        'Play': '再生する',
        'Repeat all': '連続再生',
        'Shuffle': 'シャッフル',
        'Repeat one': 'リピート',
        'Move down': '下に',
        'Move up': '上に',
        'Select': '選択',
        'Remove': '削除',
        'New': '新規作成',
        'Settings': '設定',
        'Confirm Action': '確認',
        'Add to playlist': 'プレーリストに追加',
        'Import all as a playlist': '全部を新規プレーリストに',
        'Chart': 'ランキング',
        'Artwork': 'アートワーク',
        'Media Source': '媒体源',
        'Playlist': 'プレーリスト一覧',
        'Tracks': 'プレーリスト',
        'Panel': 'パネル',
        'Search': '検索',
        'Lock the panel': 'パネルをロックする',
        'Unlock the panel': 'パネルのロックを解除する',
        'Search for music': '音楽検索',
        'Temp': '一時プレーリスト',
        'New Playlist': '新規プレーリスト',
        'Listen Randomly': '気軽に聴く',
        'Drag a track here and start random listening': 'アイテムを引いてここに置くと再生する',
        'Select a media source': '媒体源選択',
        'Select a channel': 'チャンネル選択',
        'Unknown Artist': '未知アーチスト',
        'Add to a playlist': 'プレーリストに追加',
        'Move to...': '他のリストに移動',
        'Enter edit mode': '編集モードに変換',
        'Exit edit mode': '編集モードを終了',
        'Drag a track here to remove it': 'アイテムを引いてここに置くと削除する',
        'Drag a playlist here to remove it': 'アイテムを引いてここに置くと削除する',
        'Remove duplicated tracks': '繰り返したアイテムを消す',
        'Remove duplicated tracks?': '繰り返したアイテムを削除しますか？',
        'Select a playlist': 'プレーリスト選択',
        'Remove the playlist?': 'このプレーリストを削除しますか？',
        'Select a background': 'バックグラウンド選択',
        'Select a visualizer': '視覚化タイプ選択',
        'Histogram': '柱状図',
        'Tiles': 'タイルズ',
        'Electric Arc': '電弧',
        'Random': 'ランダム',
        'Source icon': '媒体源アイコン',
        'Reset settings': '初期設定に戻る',
        'Reset': '設置',
        'Confirm settings reset': '初期設定に戻る',
        'Are you sure to reset all settings?': '全ての設定を初期化にしますか?',
        'Background': '背景',
        'Upload': 'アップロード',
        'Language': '言語',
        'Drag & Drop you files or Browse': 'ファイルをここに置いてください、或いはクリックして選択してください',
        'Select a language': '言語選択'
    },
    'ko-KR': {
        'Error': '에러',
        'Confirm': '확인',
        'Cancel': '취소',
        'Close': '닫기',
        'Play': '재생',
        'Repeat all': '연속재생',
        'Shuffle': '랜덤재생',
        'Repeat one': '반복재생',
        'Move up': '위로 이동',
        'Move down': '아래로 이동',
        'Select': '선택',
        'Remove': '삭제',
        'New': '신규작성',
        'Settings': '설정',
        'Confirm Action': '확인',
        'Add to playlist': '재생목록에 추가',
        'Import all as a playlist': 'Import all as a playlist',
        'Chart': 'Chart',
        'Artwork': 'Artwork',
        'Media Source': 'Media Source',
        'Playlist': '재생목록 일람',
        'Tracks': '재생목록',
        'Panel': '패널',
        'Search': 'Search',
        'Lock the panel': 'Lock the panel',
        'Unlock the panel': 'Unlock the panel',
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
        [mutationTypes.UPDATE_ACTIVE_PANEL_INDEX] (state, index) {
            state.activePanel.index = index;
        },
        [mutationTypes.SET_ACTIVE_PANEL_INDEX_LOCK] (state, boolean) {
            state.activePanel.lock = boolean;
        },
        [mutationTypes.SET_MODE] (state, mode) {
            state.mode = mode;
        },
        [mutationTypes.LOAD_LAYOUT] (state, layout) {
            state.layout = layout;
        },
        [mutationTypes.SAVE_LAYOUT] (state, { index, layout }) {
            state.layout[index] = layout;
        },
        [mutationTypes.SET_BACKGROUND_IMAGE] (state, url) {
            state.backgroundImage = url;
            localStorage.setItem('kaiplayerbackgroundimage', url);
        },
        [mutationTypes.SET_LOCALE] (state, locale) {
            i18n.locale = locale;
            state.locale = locale;
            localStorage.setItem('kaiplayerlocale', locale);
        },
        [mutationTypes.SET_SHOW_SOURCE_ICON] (state, showSourceIcon) {
            state.showSourceIcon = showSourceIcon;
            localStorage.setItem('kaiplayershowsouceicon', Number(showSourceIcon));
        }
    },
    actions: {
        loadLayout({ commit, state }, { mode = state.mode }) {
            const layoutData = localStorage.getItem('kaiplayerlayout' + mode);

            if (layoutData) {
                commit(mutationTypes.LOAD_LAYOUT, JSON.parse(layoutData));
            } else {
                const viewportWidth = window.innerWidth,
                    viewportHeight = window.innerHeight - document.querySelector('#control-bar').offsetHeight;

                commit(mutationTypes.LOAD_LAYOUT, generateLayout(mode, viewportWidth, viewportHeight));
            }
        },
        saveLayout({ commit, state }, { index, layout }) {
            commit(mutationTypes.SAVE_LAYOUT, { index, layout });
            localStorage.setItem('kaiplayerlayout' + state.mode, JSON.stringify(state.layout));
        }
    }
};

const sourceGroup = new SourceGroup({ name: 'Global' });

const sourceModule = {
    state: {
        sourceGroup
    },
    mutations: {
        [mutationTypes.ADD_SOURCES] (state, sources) {
            state.sourceGroup.add(...sources);
        },
        [mutationTypes.UPDATE_SOURCE] (state, { index, active }) {
            state.sourceGroup.get(index).active = active;
            localStorage.setItem('kaiplayersourceactive', JSON.stringify((() => {
                const data = {};

                state.sourceGroup.get().forEach(source => {
                   data[source.id] = source.active;
                });

                return data;
            })()));
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
                    tracks: queue.get().map(track => ({
                        id: track.id,
                        name: track.name,
                        duration: track.duration,
                        streamUrl: track.streamUrl,
                        artists: track.artists.map(artist => ({ name: artist.name })),
                        picture: track.picture
                    })),
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
                    queue.add(...queueData.tracks.map(trackData => new Track({
                        id: trackData.id,
                        name: trackData.name,
                        duration: trackData.duration,
                        streamUrl: trackData.streamUrl,
                        artists: trackData.artists.map(artistData => {
                            return new Artist({
                                name: artistData.name
                            })
                        }),
                        picture: trackData.picture
                    })));
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
        [mutationTypes.UPDATE_QUEUE_GROUP](state, { queues, active }) {
            queues && state.queueGroup.update(queues);

            if (typeof active === 'number') {
                state.queueGroup.active = active;
            }

            saveQueueData(state.queueGroup, state.playingQueueIndex);
        },

        [mutationTypes.INSERT_QUEUE](state, { index, queue }) {
            state.queueGroup.insert(index, queue);
            saveQueueData(state.queueGroup, state.playingQueueIndex);
        },

        [mutationTypes.UPDATE_QUEUE](state, { index, name, tracks, active }) {
            const queue = state.queueGroup.get(index);

            name && (queue.name = name);
            tracks && queue.update(tracks);

            if (typeof active === 'number' || active === null) {
                queue.active = active;
            }

            saveQueueData(state.queueGroup, state.playingQueueIndex);
        },

        [mutationTypes.UPDATE_PLAYING_QUEUE_INDEX](state, index) {
            state.playingQueueIndex = index;
            saveQueueData(state.queueGroup, state.playingQueueIndex);
        },

        [mutationTypes.ADD_TRACK](state, { track, queue = state.queueGroup.get(state.queueGroup.active) }) {
            queue.add(track);
            saveQueueData(state.queueGroup, state.playingQueueIndex);
        },

        [mutationTypes.UPDATE_TRACK](state, { index, duration, queue = state.queueGroup.get(state.queueGroup.active) }) {
            if (duration) {
                queue.get(index).duration = duration;
                saveQueueData(state.queueGroup, state.playingQueueIndex);
            }
        },

        [mutationTypes.SWITCH_QUEUE_MODE](state, { queue = state.queueGroup.get(state.queueGroup.active) } = {}) {
            queue.switchMode();
        }
    }
};

const playerController = new PlayerController;

playerController.connect(new Player);

const playerModule = {
    state: {
        playerController,
        get playing() {
            return this.playerController.player.playing
        }
    }
};

const backgroundType = localStorage.getItem('kaisoftbackgroundtype'),
    visualizerType = localStorage.getItem('kaisoftvisualizertype');

const visualizationModule = {
    state: {
        backgroundType,
        visualizerType,
        init: false,
        _background: null,
        _visualizer: null,
        _audioSouce: null
    },
    mutations: {
        [mutationTypes.INIT_VISUALIZATION](state, renderers) {
            state._background = new Background(backgroundType || 'three', renderers);
            state._visualizer = new Visualizer(visualizerType || 'random', renderers);
            state.init = true;
        },

        [mutationTypes.UPDATE_ACTIVE_BACKGROUND_TYPE](state, type) {
            state.backgroundType = type;
            localStorage.setItem('kaisoftbackgroundtype', type);
        },

        [mutationTypes.UPDATE_ACTIVE_VISUALIZER_TYPE](state, type) {
            state.visualizerType = type;
            localStorage.setItem('kaisoftvisualizertype', type);
        },

        [mutationTypes.VISUALIZER_LISTEN_TO](state, audioSource) {
            if (state._visualizer) {
                state._visualizer.listen(audioSource);
            }

            state._audioSouce = audioSource;
        },

        [mutationTypes.BACKGROUND_LOAD_RESOURCE](state, { picture } = {}) {
            if (state._background) {
                state._background.loadResource({ picture });
            }
        },

        [mutationTypes.VISUALIZER_LOAD_RESOURCE](state, { picture } = {}) {
            if (state._visualizer) {
                state._visualizer.loadResource({ picture });
            }
        }
    },
    actions: {
        async initVisualization({ commit, state }, mountPoint) {
            const renderers = await import('./visualization/renderers/renderers');

            try {
                renderers.threeRenderer.init(mountPoint);
            } catch (e) { }

            renderers.histogramRenderer.init(mountPoint);
            renderers.electricArcRenderer.init(mountPoint);
            renderers.artworkRenderer.init(mountPoint);

            commit(mutationTypes.INIT_VISUALIZATION, renderers);

            const playing = playerModule.state.playing;

            if (playing && state._audioSource) {
                state._visualizer.listen(state._audioSource);
                state._visualizer.activeRenderer.start();
                state._visualizer.start();
                state._visualizer.activeRenderer.show();
            } else if (!playing) {
                state._background.activeRenderer.start();
                state._background.start();
                state._background.activeRenderer.show();
            }

            const queueGroup = queueModule.state.queueGroup,
                queue = queueGroup.get(queueGroup.active),
                track = queue ? queue.get(queue.active) : null;

            if (track) {
                commit(mutationTypes.BACKGROUND_LOAD_RESOURCE, { picture: track.picture });
            }
        },
        async triggerBackgroundEvent({ commit, state }, type) {
            await state._background.event(type);
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

const vm = new Vue({
    el: 'app',
    store,
    i18n,
    render: createElement => createElement(App)
});

let cancelVisualizationChange = null;

vm.$watch(() => ([
    visualizationModule.state.backgroundType,
    visualizationModule.state.visualizerType,
    playerModule.state.playing
]), async ([newBackground, newVisualization, newPlaying], [oldBackground, oldVisualization, oldPlaying]) => {
    if (newBackground === oldBackground && newVisualization === oldVisualization && newPlaying === oldPlaying) {
        return;
    }

    if (cancelVisualizationChange) {
        cancelVisualizationChange();
    }

    const state = visualizationModule.state;

    if (!oldPlaying && state._background.animating) {
        try {
            await new Promise((resolve, reject) => {
                cancelVisualizationChange = reject;

                const unwatch = vm.$watch('$store.state.visualizationModule._background.animating', (animating) => {
                    if (animating) {
                        return;
                    }

                    unwatch();
                    cancelVisualizationChange = null;
                    resolve();
                });
            });
        } catch (e) {
            return;
        }
    }

    const background = state._background,
        oldBackgroundRenderer = background.activeRenderer;

    background.activeType = newBackground;

    const newBackgroundRenderer = background.activeRenderer;

    if (newBackground !== oldBackground) {
        if (!newPlaying && !oldPlaying && newBackgroundRenderer !== oldBackgroundRenderer) {
            oldBackgroundRenderer.hide();
            oldBackgroundRenderer.pause();
            newBackgroundRenderer.start();
            newBackgroundRenderer.show();
        }

        state._background = null;
        state._background = background;
    }

    const visualizer = state._visualizer,
        oldVisualizerRenderer = visualizer.activeRenderer;

    visualizer.activeType = newVisualization;

    const newVisualizerRenderer = visualizer.activeRenderer;

    if (newVisualization !== oldVisualization || newVisualization === 'random') {
        if (newPlaying && oldPlaying && newVisualizerRenderer !== oldVisualizerRenderer) {
            oldVisualizerRenderer.hide();
            oldVisualizerRenderer.pause();
            newVisualizerRenderer.start();
            newVisualizerRenderer.show();
        }

        state._visualizer = null;
        state._visualizer = visualizer;
    }

    if (newPlaying !== oldPlaying) {
        if (newPlaying && !oldPlaying) {
            if (oldBackgroundRenderer !== newVisualizerRenderer) {
                oldBackgroundRenderer.hide();
                newVisualizerRenderer.start();
                visualizer.start();
                newVisualizerRenderer.show();
                background.stop();
                oldBackgroundRenderer.pause();
                background.event('reset');
            } else {
                background.stop();
                visualizer.start();
            }
        } else if (!newPlaying && oldPlaying) {
            if (newBackgroundRenderer !== oldVisualizerRenderer) {
                oldVisualizerRenderer.hide();
                newBackgroundRenderer.start();
                background.start();
                newBackgroundRenderer.show();
                visualizer.stop();
                oldVisualizerRenderer.pause();
            } else {
                visualizer.stop();
                background.start();
            }
        }
    }
});
