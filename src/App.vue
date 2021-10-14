<template>
  <router-view />
</template>

<script>
import $api from '@/api';
import $userCode from '@/constants/user';
import $im from '@/constants/im';
import { onReadyStateUpdate, onKickOut, onError, onReceiveMessage, onUpdateConversationList, onNetStateChange, onMessageReadByPeer } from './utils/timLib.call-event';
import { getQueryString } from '@/utils/tools.js';

export default {
  data() {
    return {
      strUserId: getQueryString('userId'),
      strIMAccount: '',
    };
  },
  async created() {
    this.$timLib.init('1400563046'); //初始化IM
    this.fnBindEvent(); //绑定IM监听事件
    await this.handleGetUserInfo(); //获取登录学员的信息
    await this.fnLoginIM(); //登录IM
  },
  methods: {
    /**
     * 绑定IM监听事件
     */
    fnBindEvent() {
      // 登录成功后会触发 SDK_READY 事件，该事件触发后，可正常使用 SDK 接口
      this.$timLib.tim.on(this.$timLib.TIM.EVENT.SDK_READY, onReadyStateUpdate, this);
      // SDK NOT READT
      this.$timLib.tim.on(this.$timLib.TIM.EVENT.SDK_NOT_READY, onReadyStateUpdate, this);
      // 被踢出
      this.$timLib.tim.on(this.$timLib.TIM.EVENT.KICKED_OUT, onKickOut);
      // SDK内部出错
      this.$timLib.tim.on(this.$timLib.TIM.EVENT.ERROR, onError);
      // 收到新消息
      this.$timLib.tim.on(this.$timLib.TIM.EVENT.MESSAGE_RECEIVED, onReceiveMessage);
      // 会话列表更新
      this.$timLib.tim.on(this.$timLib.TIM.EVENT.CONVERSATION_LIST_UPDATED, onUpdateConversationList);
      // 网络监测
      this.$timLib.tim.on(this.$timLib.TIM.EVENT.NET_STATE_CHANGE, onNetStateChange);
      // 已读回执
      this.$timLib.tim.on(this.$timLib.TIM.EVENT.MESSAGE_READ_BY_PEER, onMessageReadByPeer);
    },

    /**
     * 获取领匠学员信息
     */
    async handleGetUserInfo() {
      let userInfo = await $api.user.getUserInfo(this.strUserId).catch(err => {
        let { code } = err;
        this.$message({
          message: $userCode.getUserInfo[code]?.showMsg || '发生异常，请重试',
          type: 'warning',
        });
      });
      if (!userInfo) return;
      //保存学员信息
      this.$store.commit('userStore/setUserInfo', userInfo);
    },

    /**
     * 获取领匠学员聊天账号
     */
    async handleGetUserIMAccount() {
      let strIMAccount = await $api.user.getUserIMAccount(this.strUserId).catch(err => {
        let { code } = err;
        this.$message({
          message: $userCode.getUserIMAccount[code]?.showMsg || '发生异常，请重试',
          type: 'warning',
        });
      });
      return strIMAccount;
    },

    /**
     * 获取聊天登录需要的秘钥
     */
    async handleGetIMSecretKey(iMAccount) {
      let strUserSig = await $api.chat.getIMConfig(iMAccount).catch(err => {
        let { code } = err;
        this.$message({
          message: $im.imConfig[code]?.showMsg || '发生异常，请重试',
          type: 'warning',
        });
      });
      return strUserSig;
    },

    /**
     * 登录IM
     */
    async fnLoginIM() {
      let { chatAccountNo } = await this.handleGetUserIMAccount();
      if (!chatAccountNo) return;

      let objUserSig = await this.handleGetIMSecretKey(chatAccountNo);
      if (!objUserSig) return;

      this.$timLib
        .login(chatAccountNo, objUserSig.userSig)
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        });
    },
  },
};
</script>

<style lang="scss"></style>
