// 消息状态（加载中；失败）
<template>
  <div style="width: 16px; height: 16px" :class="messageIconClass" @click="handleIconClick">{{ messageIconClass === 'message-send-fail' ? '!' : '' }}</div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'MessageStatusIcon',
  props: {
    objMessage: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState({
      currentConversation: state => state.chatStore.currentConversation,
      currentUserProfile: state => state.chatStore.currentUserProfile,
    }),
    messageIconClass() {
      switch (this.objMessage.status) {
        case 'unSend':
          return 'el-icon-loading';
        case 'fail':
          return 'message-send-fail';
        default:
          return 'hide';
      }
    },
  },
  methods: {
    handleIconClick() {
      if (this.messageIconClass === 'message-send-fail') {
        // 重新发送
        this.$timLib.tim.resendMessage(this.objMessage).catch(() => {});
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.el-icon-loading,
.message-send-fail {
  margin-right: 8px;
}
.message-send-fail {
  display: inline-block;
  background-color: #f35f5f;
  color: #fff;
  border-radius: 50%;
  text-align: center;
  line-height: 16px;
  cursor: pointer;
}
.hide {
  display: none;
}
</style>
