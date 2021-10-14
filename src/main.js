import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
// 公共样式
import '@/assets/styles/common/global.scss';
// elementUI
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI, { size: 'small', zIndex: 3000 });

// icon font
import './assets/icon/tim/tim.css';

// 全局注册timLib start
import timLib from './utils/timLib';
let $timLib = new timLib();
Vue.prototype.$timLib = $timLib;
window.$timLib = $timLib;
// 全局注册timLib end

// EventBus非父子组件通讯
Vue.prototype.$bus = new Vue();
// 浏览器标题闪动
Vue.prototype.$browserTitleTimer = undefined;

Vue.config.productionTip = false;

// require('./mock');

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
