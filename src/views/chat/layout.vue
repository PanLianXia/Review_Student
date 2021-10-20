<template>
  <div class="layout-wrap">
    <div class="main-wrap">
      <!-- 头部 start -->
      <div class="header-wrap">
        <div class="logo">
          <img src="@/assets/images/chat-logo.png" alt="chat-logo" />
        </div>
        <div class="service-time">
          <div class="tip">在线服务时间：</div>
          <div class="detail">
            <div class="weekdays-time detail-item">
              <div class="name">工作日</div>
              <div class="morning">上午09:00-12:00</div>
              <div class="afternoon">下午13:30-18:00</div>
            </div>
            <div class="holiday-time detail-item">
              <div class="name">节假日</div>
              <div class="morning">上午10:00-12:00</div>
              <div class="afternoon">下午14:00-18:00</div>
            </div>
          </div>
        </div>
        <div class="common-question">
          <div class="common-question-btn">公共问题</div>
        </div>
      </div>
      <!-- 头部 end -->

      <!-- 聊天区域 start -->
      <div class="chat-wrap">
        <!-- 左侧会话 start -->
        <div class="conversation-wrap">
          <!-- 左侧会话头部 start -->
          <div class="conversation-header">
            <el-avatar class="user-avatar" :src="userInfo.UserHeadImg"></el-avatar>
            <div class="user-info">
              <el-popover placement="bottom-end" title="" max-width="250" trigger="click" :content="userInfo.RealName">
                <div class="username" slot="reference">{{ userInfo.RealName }}</div>
              </el-popover>
              <div class="online-status">
                [
                <div class="dot"></div>
                <div class="status">在线</div>
                ]
              </div>
            </div>
          </div>
          <!-- 左侧会话头部 end -->
          <!-- 左侧会话列表 start -->
          <conversation-list />
          <!-- 左侧会话列表 end -->
        </div>
        <!-- 左侧会话 end -->

        <!-- 右侧消息 start -->
        <div class="message-list-wrap" v-if="currentConversation && JSON.stringify(currentConversation) != '{}'">
          <div class="message-header">
            <span v-show="strTeacherName">
              您正在和
              <span class="teacher-name">{{ strTeacherName }}</span>
              会话
            </span>
          </div>
          <div class="message-content">
            <div class="message-list" ref="messageListRef" @scroll="fnOnScroll">
              <div class="message-more" v-if="!isCompleted" ref="loadMoreMsgRef">
                <el-button type="text" @click="fnGetMessageMore">{{ strMessageMoreText }}</el-button>
              </div>
              <div class="message-no-more" v-else>没有更多历史记录了</div>
              <div>
                <message-item v-for="(message, index) in currentMessageList" :key="message.ID + index" :objMessage="message" :bIsMine="message.flow === 'out'" />
              </div>
            </div>
            <div v-show="bIsShowScrollButtomTips" class="new-message-tip" @click="handleScrollMessageListToButtom">回到最新位置</div>
          </div>

          <!-- <div class="message-send-box"></div> -->
          <message-send-box />
        </div>
        <!-- 右侧消息 end -->

        <!-- 右侧欢迎页 start -->
        <div class="welcome-wrap" v-else>
          <img src="@/assets/images/chat-welcom-img.png" alt="聊天系统欢迎图片" />
          <div class="welcome-tip">欢迎来到领匠评审聊天系统</div>
        </div>
        <!-- 右侧欢迎页 end -->
      </div>
      <!-- 聊天区域 end -->

      <!-- 图片预览 开始 -->
      <image-previewer />
      <!-- 图片预览 结束 -->
    </div>
  </div>
</template>

<script>
import ConversationList from '@/components/instant-messaging/Conversation/Index.vue'; //会话列表
import MessageItem from '@/components/instant-messaging/Message/MessageItem.vue'; //消息列表
import MessageSendBox from '@/components/instant-messaging/Message/MessageSendBox.vue'; //消息发送窗口
import ImagePreviewer from '@/components/instant-messaging/Message/ImagePreviewer.vue'; //图片预览
import { mapGetters, mapState } from 'vuex';
export default {
  name: 'chat-layout',
  components: { ConversationList, MessageItem, MessageSendBox, ImagePreviewer },
  data() {
    return {
      nPreScrollHeight: 0, // 滚动到底部需要记录的高度
      nBeforeScrollHeight: '', //消息加载更多需要记录的高度
      nAfterScrollHeight: '', //消息加载更多需要记录的高度
      bMessageIsStayPosition: false, //消息加载更多，消息保留原位置
      bIsShowScrollButtomTips: false,
      strMessageMoreText: '更多消息记录',
    };
  },
  computed: {
    ...mapState({
      isCompleted: state => state.chatStore.isCompleted,
      currentMessageList: state => state.chatStore.currentMessageList,
      currentUserProfile: state => state.chatStore.currentUserProfile,
      currentConversation: state => state.chatStore.currentConversation,
      currentUnreadCount: state => state.chatStore.currentConversation.unreadCount,
      userInfo: state => state.userStore.userInfo,
    }),
    ...mapGetters(['documentHidden']),
    strTeacherName() {
      if (this.currentConversation.type === 'C2C') {
        let name = this.currentConversation.userProfile.nick || this.toAccount;
        return name;
      } else if (this.currentConversation.type === 'GROUP') {
        return '';
      } else if (this.currentConversation.conversationID === '@TIM#SYSTEM') {
        return '系统通知';
      }
      return this.toAccount;
    },
  },
  watch: {
    // 监听当前会话未读消息数（设置已读）
    currentUnreadCount(next) {
      if (!this.documentHidden && next > 0) {
        this.$timLib.tim.setMessageRead({ conversationID: this.currentConversation.conversationID });
      }
    },

    // 监听当前页面是否focus（设置已读）
    documentHidden(next) {
      if (!next && this.currentUnreadCount > 0) {
        this.$timLib.tim.setMessageRead({ conversationID: this.currentConversation.conversationID });
      }
    },
    currentMessageList() {
      this.$nextTick(() => {
        if (this.bMessageIsStayPosition) {
          let messageListNode = this.$refs['messageListRef'];
          this.nAfterScrollHeight = messageListNode.scrollHeight - this.nBeforeScrollHeight;
          messageListNode.scrollTop = this.nAfterScrollHeight;
          this.bMessageIsStayPosition = false;
        }
      });
    },
  },
  mounted() {
    // 轮训监听当前document是否隐藏
    this.$store.commit('startComputeCurrent');
    // 设置消息滚动条在最下方
    this.handleScrollMessageListToButtom();

    this.$bus.$on('image-loaded', this.handleOnImageLoaded);
    this.$bus.$on('scroll-bottom', this.handleScrollMessageListToButtom);
  },
  updated() {
    this.handleKeepMessageListOnButtom();
  },
  beforeDestroy() {
    // 取消轮训监听当前document是否隐藏
    this.$store.commit('stopComputeCurrent');
  },
  methods: {
    /**
     * 消息块滚动
     */
    fnOnScroll({ target: { scrollTop } }) {
      let messageListNode = this.$refs['messageListRef'];
      if (!messageListNode) {
        return;
      }
      if (this.nPreScrollHeight - messageListNode.clientHeight - scrollTop < 20) {
        this.bIsShowScrollButtomTips = false;
      }
    },
    // 如果滚到底部就保持在底部，否则提示是否要滚到底部
    handleKeepMessageListOnButtom() {
      let messageListNode = this.$refs['messageListRef'];
      if (!messageListNode) {
        return;
      }
      // 距离底部20px内强制滚到底部,否则提示有新消息
      if (this.nPreScrollHeight - messageListNode.clientHeight - messageListNode.scrollTop < 20) {
        this.$nextTick(() => {
          messageListNode.scrollTop = messageListNode.scrollHeight;
        });
        this.bIsShowScrollButtomTips = false;
      } else {
        this.bIsShowScrollButtomTips = true;
      }
      this.nPreScrollHeight = messageListNode.scrollHeight;
    },

    // 滚动条滚动到底部
    handleScrollMessageListToButtom() {
      this.$nextTick(() => {
        let messageListNode = this.$refs['messageListRef'];
        if (!messageListNode) {
          return;
        }
        messageListNode.scrollTop = messageListNode.scrollHeight;
        this.nPreScrollHeight = messageListNode.scrollHeight;
        this.bIsShowScrollButtomTips = false;
      });
    },

    // 图片消息加载时
    handleOnImageLoaded() {
      this.handleKeepMessageListOnButtom();
    },

    // 获取更多消息
    fnGetMessageMore() {
      this.strMessageMoreText = '加载中...';

      this.nBeforeScrollHeight = this.$refs['messageListRef'].scrollHeight;
      this.$store.dispatch('chatStore/getMessageList', this.currentConversation.conversationID);
      this.bMessageIsStayPosition = true;

      setTimeout(() => {
        this.strMessageMoreText = '更多消息记录';
      }, 4);
    },
  },
};
</script>

<style lang="scss" scoped>
$chat-theme-color: #4b83f0;
$chat-font-color: #363e47;

.layout-wrap {
  display: flex;
  justify-content: center;
  min-width: 1000px;
}
.main-wrap {
  width: 1200px;
  margin: 68px 0;
  border-radius: 10px;
  background-color: #f3f6f9;
  box-shadow: 0px 0px 15px 1px rgba(24, 23, 22, 0.08);

  .header-wrap {
    position: relative;
    display: flex;
    align-items: center;
    height: 101px;
    width: 100%;
    margin-bottom: 20px;
    padding-left: 19px;
    background: #ffffff;
    box-shadow: 0px 0px 15px 1px rgba(24, 23, 22, 0.08);
    border-radius: 10px;
    .logo {
      height: 53px;
      margin-right: 47px;
    }
    .service-time {
      display: flex;
      .tip {
        font-size: 16px;
        color: #999;
      }
      .detail {
        font-size: 16px;
        color: $chat-font-color;
        .weekdays-time,
        .holiday-time {
          display: flex;
        }
        .weekdays-time {
          margin-bottom: 8px;
        }
        .detail-item {
          .name,
          .morning,
          .afternoon {
            margin-right: 20px;
          }
        }
      }
    }
    .common-question {
      position: absolute;
      right: 30px;
      height: 36px;
      line-height: 36px;
      padding: 0 20px;
      border: 1px solid #f45f60;
      border-radius: 18px;
      font-size: 18px;
      color: #f25d5d;
    }
  }
  .chat-wrap {
    display: flex;
    height: calc(100vh - 101px - 20px - 68px - 68px);
    .conversation-wrap,
    .message-list-wrap {
      height: 100%;
      background-color: #fff;
    }
    .conversation-wrap .conversation-header,
    .message-list-wrap .message-header {
      height: 80px;
    }
    .conversation-wrap {
      display: flex;
      flex-direction: column;
      width: 406px;
      .conversation-header {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #f1f3f6;
        .user-avatar {
          width: 69px;
          height: 69px;
          margin: 0 13px 0 32px;
          background-color: inherit;
        }
        .user-info {
          display: flex;
          font-size: 20px;
          .username {
            max-width: 185px;
            color: $chat-font-color;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            cursor: pointer;
          }
          .online-status {
            display: flex;
            align-items: center;
            color: #64a503;
            .dot {
              width: 8px;
              height: 8px;
              margin: 0 8px;
              border-radius: 50%;
              background-color: #64a503;
            }
          }
        }
      }
    }

    .message-list-wrap {
      display: flex;
      flex-direction: column;
      flex: 1;
      .message-header {
        display: flex;
        align-items: center;
        margin-left: 20px;
        font-size: 20px;
        color: $chat-font-color;
        .teacher-name {
          color: #4b83f0;
        }
      }
      .message-content {
        position: relative;
        flex: 1;
        height: 100%;
        overflow: hidden;
        .message-list {
          height: 100%;
          padding: 20px;
          background-color: #eff3f8;
          overflow: auto;
          &::-webkit-scrollbar {
            width: 4px;
            height: 2px !important;
          }
          &::-webkit-scrollbar-thumb {
            background-color: #b3aeae;
            background-clip: padding-box;
            border-radius: 4px;
          }
          &::-webkit-scrollbar-thumb:hover {
            background-color: #979090;
          }

          .message-more,
          .message-no-more {
            text-align: center;
            font-size: 16px;
            color: #99a8b4;
          }
        }

        .new-message-tip {
          position: absolute;
          right: 0;
          left: 0;
          bottom: 5px;
          width: 120px;
          margin: 0 auto;
          padding: 5px;
          color: $chat-theme-color;
          font-size: 14px;
          border-radius: 10px;
          background-color: #fff;
          text-align: center;
          cursor: pointer;
        }
      }
      .message-send-box {
        height: 172px;
      }
    }

    .welcome-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      flex: 1;
      text-align: center;
      .welcome-tip {
        width: 370px;
        height: 29px;
        margin-top: 55px;
        line-height: 25px;
        font-size: 30px;
        color: #66798f;
      }
    }
  }
}
</style>
