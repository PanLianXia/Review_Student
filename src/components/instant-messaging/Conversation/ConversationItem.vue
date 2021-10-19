<template>
  <div v-if="objConversation.type !== $timLib.TIM.TYPES.CONV_SYSTEM" class="conversation-item" :class="objConversation.conversationID === currentConversation.conversationID ? 'active-conversation' : ''" @click="fnSelectConversation">
    <el-badge :value="objConversation.unreadCount" :max="99" :hidden="objConversation.unreadCount == 0" class="unread-message-count">
      <el-avatar class="teacher-avatar" :src="strAvatar"></el-avatar>
    </el-badge>
    <div class="conversation-detail">
      <div class="conversation-top">
        <div class="nick-name">{{ strNick }}</div>
      </div>
      <div class="conversation-bottom">
        <div class="last-message">{{ strMessageForShow }}</div>
        <div class="last-message-time">{{ objConversation.lastMessage.lastTime | strFormatLastMessageDate }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { isToday, getDate, getTime } from '@/utils/date';

export default {
  props: {
    objConversation: {
      type: Object,
      require: true,
    },
  },
  computed: {
    ...mapState({
      currentConversation: state => state.chatStore.currentConversation,
      currentUserProfile: state => state.chatStore.currentUserProfile,
    }),
    // 头像
    strAvatar() {
      switch (this.objConversation.type) {
        case this.$timLib.TIM.TYPES.CONV_GROUP:
          return this.objConversation.teacherHeadPortrait || this.objConversation.groupProfile.avatar;
        case this.$timLib.TIM.TYPES.CONV_C2C:
          return this.objConversation.userProfile.avatar;
        default:
          return '';
      }
    },
    // 昵称
    strNick() {
      switch (this.objConversation.type) {
        case this.$timLib.TIM.TYPES.CONV_GROUP:
          return this.objConversation.teacherNickName || this.objConversation.groupProfile.name || this.objConversation.groupProfile.groupID;
        case this.$timLib.TIM.TYPES.CONV_C2C:
          return this.objConversation.userProfile.nick || this.objConversation.userProfile.userID;
        default:
          return '系统通知';
      }
    },
    // 最后一条消息
    strMessageForShow() {
      if (this.objConversation.lastMessage.isRevoked) {
        if (this.objConversation.lastMessage.fromAccount === this.currentUserProfile.userID) {
          return '你撤回了一条消息';
        }
        if (this.objConversation.type === this.$timLib.TIM.TYPES.CONV_C2C) {
          return '对方撤回了一条消息';
        }
        return `${this.objConversation.lastMessage.fromAccount}撤回了一条消息`;
      }
      return this.objConversation.lastMessage.messageForShow;
    },
  },
  filters: {
    strFormatLastMessageDate(value) {
      if (!value) {
        return '';
      }
      const date = new Date(value * 1000);
      if (isToday(date)) {
        return getTime(date);
      }
      return getDate(date);
    },
  },
  methods: {
    /**
     * 切换当前会话
     */
    fnSelectConversation() {
      this.$store.dispatch('chatStore/checkoutConversation', this.objConversation).catch(err => {
        console.log('err', err);
        // let { code, message } = err; //没有找到相应的用户或群组，请检查传入参数
        // this.$message.error(IM[code]?.showMsg || message);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
$chat-theme-color: #4b83f0;

.conversation-item {
  display: flex;
  align-items: center;
  height: 89px;
  border-top: 2px solid #f3f5f8;
  padding: 0 26px;
  background-color: #fff;
  cursor: pointer;
  &.active-conversation {
    background: #f4f6f9;
    border-right: 4px solid $chat-theme-color;
  }
  .teacher-avatar {
    width: 50px;
    height: 50px;
    background-color: inherit;
  }
  .conversation-detail {
    flex: 1;
    margin-left: 19px;
    .conversation-top {
      display: flex;
      justify-content: space-between;
      align-items: center;

      margin-bottom: 14px;
      .nick-name {
        font-size: 18px;
        color: #333;
      }
      .last-message-time {
        font-weight: 300;
        font-size: 16px;
        color: #999;
      }
    }
    .conversation-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      color: #6a7681;
      .last-message {
        max-width: 200px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
