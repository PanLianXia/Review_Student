<template>
  <div class="message-send-box" @drop="fnDropHandler" @paste="fnPasteHandler">
    <div class="send-header-bar">
      <el-popover placement="top" width="400" trigger="click">
        <div class="emoji-block">
          <div v-for="(value, key) in enumEmoji" class="emoji" :key="key" @click="fnChooseEmoji(key)">
            <img :src="strEmojiUrl + value" style="width: 30px; height: 30px" />
          </div>
        </div>
        <img src="@/assets/images/icon-send-emoji.png" slot="reference" class="send-emoji-icon" title="发表情" />
      </el-popover>
      <img src="@/assets/images/icon-send-file.png" class="send-file-icon" title="发文件" @click="fnSendFileClick" />
    </div>
    <div class="bottom">
      <textarea class="text-input" rows="5" v-model="strMessageContent" @keydown.enter.exact.prevent="fnSendTextMessage" />
      <div class="online-consult-time">
        在线咨询时间
        <el-popover placement="top-start" popper-class="consult-time-popover" trigger="hover">
          <div class="title">
            <img src="@/assets/images/icon-notice.png" alt="通知" />
            评审老师在线咨询时间
          </div>
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
          <img src="@/assets/images/icon-question.png" slot="reference" alt="问题" />
        </el-popover>
      </div>
      <div class="send-btn">
        <el-tooltip class="item" effect="dark" content="按Enter发送消息,Shift+Enter换行" placement="left">
          <el-button type="primary" @click="fnSendTextMessage">发送</el-button>
        </el-tooltip>
      </div>
    </div>

    <input type="file" id="filePicker" ref="filePickerRef" @change="fnSendFile" style="display: none" />
  </div>
</template>

<script>
import { emojiMap } from '@/utils/emojiMap';
import IM from '@/constants/im'; //返回提示
import { mapGetters, mapState } from 'vuex';
import { getFileType } from '@/utils/tools.js';

export default {
  name: 'MessageSendBox',
  data() {
    return {
      regImageType: /^image\//,
      enumEmoji: emojiMap,
      strEmojiUrl: process.env.VUE_APP_EMOJI_URL,
      strMessageContent: '',
    };
  },
  computed: {
    ...mapState({
      currentConversation: state => state.chatStore.currentConversation,
    }),
    ...mapGetters('chatStore', ['toAccount']),
  },
  methods: {
    /**
     * emojiName：表情名 [微笑]
     */
    fnChooseEmoji(emojiName) {
      this.strMessageContent += emojiName;
    },

    /**
     * 点击发送文件icon
     */
    fnSendFileClick() {
      this.$refs.filePickerRef.click();
    },

    /**
     * 发送图片或文件
     */
    fnSendFile(e) {
      let file = Array.from(e.target.files)[0];
      // 发送图片
      if (this.regImageType.test(file.type)) {
        this.handleSendImage(file);
        return;
      }
      // 发送文件
      this.handleSendFile(file);
    },

    /**
     * 发送图片
     */
    handleSendImage(file) {
      // 不大于10M
      const isLessThen10M = file.size / 1024 / 1024 < 10;
      if (!isLessThen10M) {
        this.$message({
          message: '上传图片大小不能超过10MB!',
          type: 'info',
        });
        return;
      }

      // 创建消息实例
      let message = this.$timLib.tim.createImageMessage({
        to: this.toAccount,
        conversationType: this.currentConversation.type,
        payload: {
          file: file,
        },
        onProgress: percent => {
          this.$set(message, 'progress', percent);
        },
      });
      this.$store.commit('chatStore/pushCurrentMessageList', message);

      // 发送消息
      this.$timLib.tim.sendMessage(message).catch(imError => {
        this.$message({
          message: `图片发送失败，${imError.message}`,
          type: 'error',
        });
      });
      this.$refs.filePickerRef.value = null;
    },

    /**
     *拖拽发送图片或文件
     */
    fnDropHandler(e) {
      e.preventDefault();
      let file = e.dataTransfer.files[0];

      let arrAllowDropFileType = ['word', 'excel', 'ppt', 'pdf', 'txt'];
      let fileType = getFileType(file.name);
      if (!arrAllowDropFileType.includes(fileType) && !this.regImageType.test(file.type)) {
        this.$message({
          message: '拖拽支持图片、PDF、WORD、EXCEL、PPT、TXT',
          type: 'error',
        });
        return;
      }

      // 发送图片
      if (this.regImageType.test(file.type)) {
        this.handleSendImage(file);
        return;
      }
      // 发送文件
      this.handleSendFile(file);
    },

    /**
     * 粘贴发送图片
     */
    fnPasteHandler(e) {
      let clipboardData = e.clipboardData;
      let file;
      if (clipboardData && clipboardData.files && clipboardData.files.length > 0) {
        file = clipboardData.files[0];
      }
      if (typeof file === 'undefined') return;
      if (!this.regImageType.test(file.type)) {
        this.$message({
          message: '只允许粘贴发送图片',
          type: 'error',
        });
        return;
      }
      this.handleSendImage(file);
    },

    /**
     *  发送文件
     */
    handleSendFile(file) {
      // 不能发送空文件
      const isEmptyFile = file.size === 0;
      if (isEmptyFile) {
        this.$message({
          message: '不能上传空文件!',
          type: 'info',
        });
        return;
      }

      // 文件不能大于10M
      const isLessThen10M = file.size / 1024 / 1024 < 10;
      if (!isLessThen10M) {
        this.$message({
          message: '上传文件大小不能超过10MB!',
          type: 'info',
        });
        return;
      }

      // 创建消息实例
      const message = this.$timLib.tim.createFileMessage({
        to: this.toAccount,
        conversationType: this.currentConversation.type,
        payload: {
          file: file,
        },
        onProgress: percent => {
          this.$set(message, 'progress', percent); // 手动给message 实例加个响应式属性: progress
        },
      });
      this.$store.commit('chatStore/pushCurrentMessageList', message);
      this.$bus.$emit('scroll-bottom');

      // 发送消息
      this.$timLib.tim.sendMessage(message).catch(imError => {
        this.$message({
          message: `图片发送失败，${imError.message}`,
          type: 'error',
        });
      });
      this.$refs.filePickerRef.value = null;
    },

    /**
     * 发送文本消息
     */
    fnSendTextMessage() {
      // 不能发送空消息
      if (this.strMessageContent === '' || this.strMessageContent.trim().length === 0) {
        this.strMessageContent = '';
        this.$store.commit('showMessage', {
          message: '不能发送空消息哦！',
          type: 'info',
        });
        return;
      }

      // 创建消息实例
      let message = this.$timLib.tim.createTextMessage({
        to: this.toAccount,
        conversationType: this.currentConversation.type,
        payload: { text: this.strMessageContent },
      });

      this.$store.commit('chatStore/pushCurrentMessageList', message);
      this.$bus.$emit('scroll-bottom');

      // 发送消息
      this.$timLib.tim.sendMessage(message).catch(imError => {
        console.warn('sendMessage error:', imError);
        let { code, message } = imError; //没有找到相应的用户或群组，请检查传入参数
        this.$message.error(IM?.im[code]?.showMsg || message);
      });
      this.strMessageContent = '';
    },
  },
};
</script>

<style lang="scss">
// 在线咨询时间popover
.consult-time-popover {
  min-width: 375px;
  box-shadow: 0px 0px 4px 0px rgb(0 0 0 / 6%);
  border-radius: 6px;
  background: #fbfbfb;
}
</style>

<style lang="scss" scoped>
$chat-theme-color: #4b83f0;

.message-send-box {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: 9px 16px 19px;
  background-color: #fff;
  .send-header-bar {
    padding: 3px 0 0 0;
    box-sizing: border-box;
    .send-emoji-icon,
    .send-file-icon {
      margin-right: 17px;
      color: $chat-theme-color;
      cursor: pointer;
    }
    .send-emoji-icon {
      height: 29px;
    }
    .send-file-icon {
      height: 23px;
    }
  }
  .bottom {
    position: relative;
    height: 120px;
    padding-top: 10px;
    .text-input {
      width: 100%;
      border: 0;
      resize: none;
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
    }
    .online-consult-time {
      position: absolute;
      left: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
      color: #666;
      img {
        margin-left: 10px;
        cursor: pointer;
      }
    }
    .send-btn {
      position: absolute;
      right: 0;
      bottom: 0;
      padding: 6px 6px 4px 4px;
      border-radius: 50%;
      color: #2d8cf0;
      font-size: 30px;
      cursor: pointer;
      .el-button--primary {
        background-color: $chat-theme-color;
        border-color: $chat-theme-color;
      }
    }
  }
}

// 表情快
.emoji-block {
  display: flex;
  flex-flow: wrap;
  height: 150px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 4px;
    height: 2px !important;
  }
  .emoji {
    margin: 0 10px 10px 0;
  }
}

// 在线咨询时间popover start
.consult-time-popover {
  .title {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding-left: 7px;
    font-size: 16px;
    color: #333;

    & > img {
      margin-right: 10px;
    }
  }
  .detail {
    padding-left: 35px;
    font-size: 14px;
    color: #666;
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
// 在线咨询时间popover end
</style>
