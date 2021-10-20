<template>
  <div class="message-wrap" :class="strMessagePosition" v-if="bShowMessageItem">
    <!-- 未撤回消息 -->
    <div v-if="!objMessage.isRevoked">
      <div class="main-wrap">
        <!-- 头像部分 -->
        <div class="col-1">
          <el-avatar class="avatar-img" :src="strAvatar"></el-avatar>
        </div>

        <!-- 消息主体 -->
        <div class="col-2" @mousedown.stop @contextmenu.prevent>
          <div class="message-content-wrap">
            <message-status-icon :objMessage="objMessage" />
            <el-dropdown trigger="" ref="dropdown" placement="bottom" class="message-dropdown" @command="fnDropdownCommand">
              <div class="message-content" :class="strBubbleStyle" :id="objMessage.ID">
                <!-- 文字和表情消息 -->
                <div v-if="objMessage.type === $timLib.TIM.TYPES.MSG_TEXT" class="text-box">
                  <template v-for="(item, index) in arrContentList">
                    <span :key="index" v-if="item.name === 'text'">{{ item.text }}</span>
                    <img v-else-if="item.name === 'emoji'" :src="item.src" width="20px" height="20px" :key="index" />
                  </template>
                </div>
                <!-- 图片消息 -->
                <div v-if="objMessage.type === $timLib.TIM.TYPES.MSG_IMAGE" class="img-box">
                  <img class="image-element" :src="strImageUrl" @load="fnOnImageLoaded" @click="fnImagePreviewer" />
                  <!-- <el-progress v-if="objMessage.status === 'unSend'" :percentage="nPercentage" :color="percentage => (percentage === 100 ? '#67c23a' : '#409eff')" /> -->
                  <div class="download" @click="fnDownloadFile(strImageUrl, '图片')">下载</div>
                </div>
                <!-- 文件消息 -->
                <div v-if="objMessage.type === $timLib.TIM.TYPES.MSG_FILE" class="file-box">
                  <div class="file-element">
                    <img class="file-type-pic" :src="require('@/assets/images/file-message/' + objFileIcons[strFileType].iconUrl)" alt="pdf" />
                    <div class="file-info">
                      <div class="file-name">{{ objMessage.payload.fileName }}</div>
                      <div class="file-size">{{ Math.ceil(objMessage.payload.fileSize / 1024) }}KB</div>
                    </div>
                  </div>
                  <div class="download" @click="fnDownloadFile(objMessage.payload.fileUrl, objMessage.payload.fileName)">下载</div>
                </div>
              </div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="copy" v-show="objMessage.status !== 'fail'">复制</el-dropdown-item>
                <el-dropdown-item command="merger" v-show="objMessage.status !== 'fail'">多选</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>
    <!-- 撤回消息 -->
    <div v-else class="revoked-wrap">
      {{ strRevokedMessage }}
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import MessageStatusIcon from './MessageStatusIcon.vue';
import { decodeText } from '@/utils/emojiMap';
import { downloadFile } from '@/utils/tools';

export default {
  name: 'MessageItem',
  components: { MessageStatusIcon },
  props: {
    bIsMine: {
      type: Boolean,
    },
    objMessage: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {
      objFileIcons: {
        pdf: { name: 'pdf', iconUrl: 'pdf-icon.png' },
        excel: { name: 'excel', iconUrl: 'excel-icon.png' },
        ppt: { name: 'ppt', iconUrl: 'ppt-icon.png' },
        word: { name: 'word', iconUrl: 'word-icon.png' },
        blueUnknown: { name: 'unknown', iconUrl: 'unknown-blue-icon.png' },
        whiteUnknown: { name: 'unknown', iconUrl: 'unknown-white-icon.png' },
      },
    };
  },
  computed: {
    ...mapState({
      userInfo: state => state.userStore.userInfo,
      currentConversation: state => state.chatStore.currentConversation,
    }),
    bShowMessageItem() {
      // 群提示信息不展示
      return !(
        (
          this.objMessage.type === this.$timLib.TIM.TYPES.MSG_GRP_TIP || //群提示消息
          this.objMessage.type === this.$timLib.TIM.TYPES.GRP_TIP_MBR_JOIN || //有成员加群
          this.objMessage.type === this.$timLib.TIM.TYPES.GRP_TIP_MBR_QUIT || //有群成员退群
          this.objMessage.type === this.$timLib.TIM.TYPES.GRP_TIP_MBR_KICKED_OUT || //有群成员被踢出群
          this.objMessage.type === this.$timLib.TIM.TYPES.GRP_TIP_MBR_SET_ADMIN || //有群成员被设为管理员
          this.objMessage.type === this.$timLib.TIM.TYPES.GRP_TIP_MBR_CANCELED_ADMIN || //有群成员被撤销管理员
          this.objMessage.type === this.$timLib.TIM.TYPES.GRP_TIP_GRP_PROFILE_UPDATED || //群组资料变更
          this.objMessage.type === this.$timLib.TIM.TYPES.GRP_TIP_MBR_PROFILE_UPDATED
        ) //群成员资料变更
      );
    },
    //头像
    strAvatar() {
      return this.bIsMine ? this.userInfo.UserHeadImg : this.objMessage.avatar;
    },
    // 设置消息的位置
    strMessagePosition() {
      // 撤回消息在中间显示
      if (this.objMessage.isRevoked) {
        return 'position-center';
      }
      // 我的消息在右边展示
      if (this.bIsMine) {
        return 'position-right';
      }
      // 对方消息在左边展示
      else {
        return 'position-left';
      }
    },

    // 表情消息处理
    arrContentList() {
      return decodeText(this.objMessage.payload);
    },

    // 接收的图片处理
    strImageUrl() {
      const url = this.objMessage.payload.imageInfoArray[0].url;
      if (typeof url !== 'string') {
        return '';
      }
      return url.slice(0, 2) === '//' ? `https:${url}` : url;
    },

    // 图片进度条数值
    nPercentage() {
      return Math.floor((this.objMessage.progress || 0) * 100);
    },

    // 撤回消息显示处理
    strRevokedMessage() {
      if (this.objMessage.conversationType === this.$timLib.TIM.TYPES.CONV_C2C && !this.bIsMine) {
        return '对方撤回了一条消息';
      }
      if (this.objMessage.conversationType === this.$timLib.TIM.TYPES.CONV_GROUP && !this.bIsMine) {
        return `${this.objMessage.from}撤回了一条消息`;
      }
      return '你撤回了一条消息';
    },

    // 设置发送方和接收方气泡
    strBubbleStyle() {
      let classString = '';
      if (this.bIsMine) {
        classString += 'message-send';
      } else {
        classString += 'message-received';
      }
      return classString;
    },

    // 文件类型
    strFileType() {
      let flieArr = this.objMessage.payload.fileName.split('.');
      let suffix = flieArr[flieArr.length - 1];
      let fileType = '';
      switch (suffix) {
        case 'doc':
        case 'docx':
          fileType = 'word';
          break;
        case 'xlsx':
        case 'xls':
          fileType = 'excel';
          break;
        case 'ppt':
        case 'pptx':
          fileType = 'ppt';
          break;
        case 'pdf':
          fileType = 'pdf';
          break;
        default:
          fileType = this.bIsMine ? 'whiteUnknown' : 'blueUnknown';
      }
      return fileType;
    },
  },
  mounted() {
    if (this.$refs.dropdown && this.$refs.dropdown.$el) {
      this.$refs.dropdown.$el.addEventListener('mousedown', this.handleDropDownMousedown);
    }
  },
  beforeDestroy() {
    if (this.$refs.dropdown && this.$refs.dropdown.$el) {
      this.$refs.dropdown.$el.removeEventListener('mousedown', this.handleDropDownMousedown);
    }
  },
  methods: {
    // 右键显示功能按钮
    handleDropDownMousedown(e) {
      if (e.buttons === 2) {
        if (this.$refs.dropdown.visible) {
          this.$refs.dropdown.hide();
        } else {
          this.$refs.dropdown.show();
        }
      }
    },

    // 图片加载
    fnOnImageLoaded(event) {
      this.$bus.$emit('image-loaded', event);
    },

    // 图片预览
    fnImagePreviewer() {
      this.$bus.$emit('image-preview', this.objMessage.payload.imageInfoArray[0].imageUrl);
    },

    // 下载文件
    fnDownloadFile(url, fileName) {
      downloadFile(url, fileName);
    },

    // 消息下拉功能（撤回、复制、转发）点击事件
    fnDropdownCommand(command) {
      switch (command) {
        case 'copy':
          this.handleMessageCopy();
          break;
        case 'merger':
          this.handleMessageMerger();
          break;
        default:
          break;
      }
    },

    // 复制消息
    handleMessageCopy() {
      var div = document.getElementById(this.objMessage.ID);
      if (document.body.createTextRange) {
        let range = document.body.createTextRange();
        range.moveToElementText(div);
        range.select();
      } else if (window.getSelection) {
        let selection = window.getSelection();
        let range = document.createRange();
        range.selectNodeContents(div);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        console.warn('none');
      }
      document.execCommand('Copy'); // 执行浏览器复制命令
    },

    // 多选消息
    handleMessageMerger() {},
  },
};
</script>

<style lang="scss" scoped>
// 消息右键的功能菜单 start
.el-popper[x-placement^='bottom'] {
  margin-top: -5px !important;
}
.el-dropdown-menu--small .el-dropdown-menu__item {
  font-size: 18px;
  color: #333;
}
// 消息右键的功能菜单 end

.message-wrap {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  .main-wrap {
    display: flex;
    .col-1 {
      .avatar-img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: inherit;
      }
    }
    .col-2 {
      display: flex;
      flex-direction: column;
      .message-content-wrap {
        .message-content {
          position: relative;
          display: flex;
          align-items: center;
          max-width: 350px;
          min-height: 37px;
          margin-top: 8px;
          padding: 10px;
          font-size: 16px;
          word-break: break-word;
          &::before {
            position: absolute;
            top: 0;
            width: 12px;
            height: 53px;
            content: '\E900';
            font-family: 'tim' !important;
            font-size: 24px;
          }
          // 气泡消息选中颜色
          .text-box,
          .img-box,
          .file-box {
            ::selection {
              background: #f96666;
              color: #fff;
            }
            ::-moz-selection {
              background: #f96666;
              color: #fff;
            }
            ::-webkit-selection {
              background: #f96666;
              color: #fff;
            }
          }
          .img-box .download,
          .file-box .download {
            margin-top: 10px;
            padding-top: 8px;
            text-align: center;
            font-size: 16px;
            cursor: pointer;
          }
          .img-box {
            .image-element {
              max-width: 250px;
              cursor: zoom-in;
            }
          }
          .file-box {
            .file-element {
              display: flex;
              .file-type-pic {
                height: 34px;
                margin-right: 10px;
              }
              .file-info {
                .file-name {
                  font-size: 18px;
                }
                .file-size {
                  font-size: 12px;
                }
              }
            }
          }
        }
        .message-send {
          background-color: #4b83f0;
          margin-right: 10px;
          border-radius: 4px 0 4px 4px;
          color: #fff;
          &::before {
            right: -10px;
            color: #4b83f0;
          }
          .img-box .download,
          .file-box .download {
            border-top: 1px solid rgba(255, 255, 255, 0.6);
          }
        }
        .message-received {
          background-color: #fff;
          margin-left: 10px;
          border-radius: 0 4px 4px 4px;
          color: #333;
          &::before {
            left: -10px;
            transform: scaleX(-1);
            color: #fff;
          }
          .img-box .download,
          .file-box .download {
            color: #999;
            border-top: 1px solid #eee;
          }
          .file-info .file-size {
            color: #999;
          }
        }
        .message-status {
          margin-top: 5px;
          color: #99a8b4;
          font-size: 16px;
          text-align: right;
        }
      }
    }
  }
  .revoked-wrap {
    width: fit-content;
    margin: 0 auto;
    padding: 4px 15px;
    background: #fff;
    border-radius: 3px;
    color: #a5b5c1;
    font-size: 14px;
    .edit-button {
      padding: 0;
      font-size: 14px;
    }
  }
  &.position-right {
    .main-wrap {
      flex-direction: row-reverse;
    }
  }
  &.position-center {
    justify-content: center;
  }
}
</style>
