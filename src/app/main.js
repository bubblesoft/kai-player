/**
 * Created by qhyang on 2017/12/1.
 */

import Vue from 'vue';
import Vuex from 'vuex';

import jQuery from 'jquery';
import i18next from 'i18next';

import SourceGroup from './source/SourceGroup';
import Source from './source/Source';
import Channel from './source/Channel';
import QueueGroup from './queue/QueueGroup';
import Queue from './queue/Queue';
import Track from './Track';
import Artist from './Artist';
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
                'Chart': 'Chart',
                'Media Source': 'Media Source',
                'Playlist': 'Playlist',
                'Tracks': 'Tracks',
                'Panel': 'Panel',
                'Search': 'Search',
                'Search for music': 'Search for music'
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
                'Search for music': '搜索音乐'
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
                'Search for music': 'Search for music'
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
                'Search for music': 'Search for music'
            }
        }
    }
});

const generalModule = {
    state: {
        i18n: i18next
    }
};

const sourceGroup = new SourceGroup({ name: 'Global' });

const getWySrc = track => {
        return new Promise((resolve, reject) => {
            jQuery.ajax({
                url: require('../config').urlBase + '/music/url?id=' + track.id.slice(3),
                method: 'GET',
                dataType: 'json',
                success(res) {
                    resolve(res.data[0].url);
                },
                error(xhr, message) {
                    reject(message);
                }
            });
        });
    },
    sourceWy = new Source({
        id: 'wy',
        name: '网易云音乐',
        search(keywords) {
            return new Promise((resolve, reject) => {
                jQuery.ajax({
                    url: require('../config').urlBase + '/search?keywords=' + keywords,
                    method: 'GET',
                    dataType: 'json',
                    success(res) {
                        const output = [];

                        res.result.songs.forEach(el => {
                            output.push(new Track({
                                id: 'wy_' + el.id,
                                name: el.name,
                                duration: el.duration,
                                artists: (() => {
                                    const output = [];

                                    el.artists.forEach(el => {
                                        output.push(new Artist({ name: el.name }));
                                    });

                                    return output;
                                })(),
                                getSrc: getWySrc
                            }));
                        });

                        resolve(output);
                    },
                    error(xhr, message) {
                        reject(message);
                    }
                });
            });
        }
    });

sourceWy.add(new Channel({
    source: 'wy',
    type: 'hot',
    name: '云音乐热歌榜',
    get() {
        return new Promise((resolve, reject) => {
            jQuery.ajax({
                url: require('../config').urlBase + '/top/list?idx=1',
                method: 'GET',
                dataType: 'json',
                success(res) {
                    const output = [];

                    res.playlist.tracks.forEach(el => {
                        output.push(new Track({
                            id: 'wy_' + el.id,
                            name: el.name,
                            duration: el.dt,
                            artists: (() => {
                                const output = [];

                                el.ar.forEach(el => {
                                    output.push(new Artist({ name: el.name }));
                                });

                                return output;
                            })(),
                            getSrc: getWySrc
                        }));
                    });

                    resolve(output);
                },
                error(xhr, message) {
                    reject(message);
                }
            });
        });
    }
}));
sourceGroup.add(sourceWy);

const sourceModule = {
    state: {
        sourceGroup
    }
};

const queueGroup = new QueueGroup({ name: 'Global' });

queueGroup.add(new Queue({ name: 'Temp' }));

const queueModule = {
    state: {
        queueGroup
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

new Vue({
    el: 'app',
    store,
    render: (createElement) => createElement(App)
});

import '../styles/bootstrap';
import '../styles/base';
