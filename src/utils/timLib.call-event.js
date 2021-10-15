import { Message } from 'element-ui';
import { combineConversationData } from '@/utils/common.js';
import TimLib from './timLib';
// import $api from '@/api';

/**
 * TimLib的监听整件回调
 */
import store from '@/store';

/**
 * 监听 readyState
 * @param {*} param0
 */
export const onReadyStateUpdate = async ({ name }) => {
  let $timLib = new TimLib();
  const isSDKReady = name === $timLib.TIM.EVENT.SDK_READY ? true : false;
  if (isSDKReady) {
    //获取登录者信息
    let myProfileResult = await $timLib.tim.getMyProfile().catch(error => {
      this.$store.commit('showMessage', {
        type: 'error',
        message: error.message,
      });
    });
    store.commit('chatStore/updateCurrentUserProfile', myProfileResult.data);

    // 更新会话列表
    let imConversationListResult = await $timLib.tim.getConversationList().catch(imError => {
      console.warn('getConversationList error:', imError); // 获取会话列表失败的相关信息
    });
    onUpdateConversationData(imConversationListResult.data.conversationList);

    // 获取消息列表
    let currentConversation = store.state.chatStore.currentConversation;
    if (currentConversation && JSON.stringify(currentConversation) !== '{}') {
      store.dispatch('chatStore/checkoutConversation', { conversationID: currentConversation.conversationID });
    }
  }
};

/**
 * 被踢出
 * @param {*} event
 */
export const onKickOut = event => {
  Message.error(`${kickedOutReason(event.data.type)}被踢出，请重新登录。`);
  // this.$store.commit('toggleIsLogin', false);
  // this.$store.commit('reset');
};
/**
 * SDK内部出错
 * @param {*} param0
 */
export const onError = ({ data }) => {
  if (data.message !== 'Network Error') {
    Message.error(data.message);
  }
};

/**
 * 监听收到的消息
 * @param {Array} param0
 */
export const onReceiveMessage = ({ data: messageList }) => {
  // TODO只需要将服务老师的消息push
  store.commit('chatStore/pushCurrentMessageList', messageList);

  // 标题栏闪动
  // let showHasNewMessageTip = true;
  // if (store.getters.documentHidden) {
  //   Vue.prototype.$browserTitleTimer = setInterval(() => {
  //     document.title = showHasNewMessageTip ? '你有新消息' : projectConfig.name;
  //     showHasNewMessageTip = !showHasNewMessageTip;
  //   }, 1000);
  // }
};

/**
 * 更新会话列表
 * @param {*} event
 */
export const onUpdateConversationData = async imConversationList => {
  let conversationData = combineConversationData(store.state.chatStore.conversationTeacherList, imConversationList);
  store.commit('chatStore/updateConversationData', conversationData);
  // $api.conversation.getConversationList().catch(err => console.log(err));
  // store.commit('chatStore/updateConversationData', res.list);
};

/**
 * 网络监测
 */
export const onNetStateChange = event => {
  Message({
    message: checkoutNetState(event.data.state),
    type: 'warning',
  });
};

/**
 * 已读回执
 */
export const onMessageReadByPeer = () => {};

function checkoutNetState(state) {
  switch (state) {
    case this.TIM.TYPES.NET_STATE_CONNECTED:
      return { message: '已接入网络', type: 'success' };
    case this.TIM.TYPES.NET_STATE_CONNECTING:
      return { message: '当前网络不稳定', type: 'warning' };
    case this.TIM.TYPES.NET_STATE_DISCONNECTED:
      return { message: '当前网络不可用', type: 'error' };
    default:
      return '';
  }
}

function kickedOutReason(type) {
  switch (type) {
    case this.TIM.TYPES.KICKED_OUT_MULT_ACCOUNT:
      return '由于多实例登录';
    case this.TIM.TYPES.KICKED_OUT_MULT_DEVICE:
      return '由于多设备登录';
    case this.TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED:
      return '由于 userSig 过期';
    default:
      return '';
  }
}
