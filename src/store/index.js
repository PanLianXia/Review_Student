import Vue from 'vue';
import Vuex from 'vuex';
//引入vuex 数据持久化插件
import createPersistedState from 'vuex-persistedstate';
Vue.use(Vuex);

import appStore from './appStore';
import userStore from './user';
import chatStore from './chat';
export default new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    currentTime: Date.now(), // 当前时间
    intervalID: 0,
  },
  getters: {
    // 判断当前document是否是隐藏状态
    documentHidden(state) {
      // eslint-disable-next-line no-unused-vars
      const temp = state.currentTime;
      if (typeof document.hasFocus !== 'function') {
        return document.hidden;
      }
      return !document.hasFocus();
    },
  },
  mutations: {
    startComputeCurrent(state) {
      state.intervalID = setInterval(() => {
        state.currentTime = Date.now();
      }, 500);
    },
    stopComputeCurrent(state) {
      clearInterval(state.intervalID);
      state.intervalID = 0;
    },
  },
  modules: {
    appStore,
    userStore,
    chatStore,
  },
});
