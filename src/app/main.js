/**
 * Created by qhyang on 2017/12/1.
 */

import Vue from 'vue';
import Vuex from 'vuex';

import Player from './Player';
import App from './app';

Vue.use(Vuex);

const playerModule = {
    state: {
        player: new Player
    }
};

const store = new Vuex.Store({
    modules: {
        playerModule
    }
});

    new Vue({
    el: 'app',
    store,
    render: (createElement) => createElement(App)
});

import '../styles/base';