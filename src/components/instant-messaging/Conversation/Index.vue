<template>
  <div class="conversation-list-wrap">
    <!-- TODO -->
    <div class="service-item" v-for="(conversationList, reviewTypeName) in conversationData" :key="reviewTypeName">
      <div class="service-title">
        <div class="left-border"></div>
        {{ reviewTypeName }}
      </div>
      <conversation-item v-for="conversation in conversationList" :key="conversation.conversationID" :objConversation="conversation" />
      <div class="white-space"></div>
    </div>
  </div>
</template>

<script>
import $api from '@/api';
import { mapState } from 'vuex';
import ConversationItem from './ConversationItem.vue';

export default {
  name: 'ConversationList',
  components: { ConversationItem },
  data() {
    return {
      // arrConversationList: []
    };
  },
  computed: {
    ...mapState({
      conversationData: state => state.chatStore.conversationData,
    }),
  },
  methods: {
    async fnGetConversationList() {
      let conversationList = await $api.conversation.getConversationList();
      console.log('conversationList', conversationList);
      this.$store.commit('chatStore/updateConversationList', conversationList);
    },
  },
};
</script>

<style lang="scss">
// 未读消息数
.unread-message-count .el-badge__content.is-fixed {
  right: 18px;
}
</style>
<style lang="scss" scoped>
$chat-theme-color: #4b83f0;

.conversation-list-wrap {
  flex: 1;
  border-right: 2px solid #eff3f8;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #dddddd;
    background-clip: padding-box;
    border-radius: 4px;
  }
  .service-item {
    flex: 1;
    overflow: auto;
    background-color: #f3f6f9;
    &:not(:last-child) {
      padding-bottom: 10px;
    }
    .service-title {
      display: flex;
      align-items: center;
      height: 67px;
      padding-left: 13px;
      background-color: #fff;
      font-size: 24px;
      color: #363e47;
      .left-border {
        width: 5px;
        height: 13px;
        margin-right: 7px;
        background: $chat-theme-color;
        border-radius: 2px;
      }
    }

    .white-space {
      height: 10px;
      background-color: #fff;
      border-top: 2px solid #f3f5f8;
    }
  }
}
</style>
