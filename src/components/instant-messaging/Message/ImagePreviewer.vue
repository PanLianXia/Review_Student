<template>
  <div class="image-previewer-wrap" v-show="bVisible" @mousewheel="fnMouseWheel">
    <div class="image-wrapper">
      <img class="image-preview" :style="{ transform: `scale(${nZoom}) rotate(${nRotate}deg)` }" :src="imgUrlList[nIndex]" @click="fnCloseImagePreview" alt="关闭" />
    </div>
    <img src="@/assets/icon/img-preview/close-icon.png" class="previewer-button el-icon-close close-button" @click="fnCloseImagePreview" alt="上一张" />
    <div class="actions-bar">
      <img src="@/assets/icon/img-preview/next-prev-icon.png" @click="fnGoPrev" v-if="nIndex !== 0" class="actions-bar-icon prev" alt="上一张" />
      <img src="@/assets/icon/img-preview/next-prev-disable-icon.png" v-else class="actions-bar-icon prev-disable" alt="上一张" />
      <span class="image-counter">{{ nIndex + 1 }} / {{ imgUrlList.length }}</span>
      <img src="@/assets/icon/img-preview/next-prev-icon.png" @click="fnGoNext" v-if="nIndex !== imgUrlList.length - 1" class="actions-bar-icon" alt="下一张" />
      <img src="@/assets/icon/img-preview/next-prev-disable-icon.png" v-else class="actions-bar-icon next-disable" alt="下一张" />
      <img src="@/assets/icon/img-preview/zoom-in-icon.png" @click="fnZoomIn" class="actions-bar-icon" alt="放大" />
      <img src="@/assets/icon/img-preview/zoom-out-icon.png" @click="fnZoomOut" class="actions-bar-icon" alt="缩小" />
      <img src="@/assets/icon/img-preview/download-icon.png" @click="fnImageDownload" class="actions-bar-icon" alt="下载" />
    </div>
  </div>
</template>

<script>
import { downloadFile } from '@/utils/tools';
import { mapGetters } from 'vuex';
export default {
  name: 'ImagePreview',
  data() {
    return {
      strUrl: '',
      nIndex: 1, // 图片的在图片列表中的index
      bVisible: false,
      nZoom: 1,
      nRotate: 0,
    };
  },
  computed: {
    ...mapGetters('chatStore', ['imgUrlList']),
    bShowPreviewer() {
      return this.strUrl && this.bVisible;
    },
  },
  mounted() {
    this.$bus.$on('image-preview', this.handleImagePreview);
  },
  methods: {
    // 鼠标滚动事件
    fnMouseWheel(e) {
      if (e.wheelDelta > 0) {
        this.fnZoomIn();
      } else {
        this.fnZoomOut();
      }
    },
    // 关闭图片预览
    fnCloseImagePreview() {
      this.nZoom = 1;
      this.bVisible = false;
    },
    // 预览前一张图片
    fnGoPrev() {
      this.nIndex = this.nIndex - 1 < 0 ? this.nIndex : this.nIndex - 1;
    },
    // 预览下一张图片
    fnGoNext() {
      this.nIndex = this.nIndex === this.imgUrlList.length - 1 ? this.nIndex : this.nIndex + 1;
    },
    // 图片缩小
    fnZoomOut() {
      // nZoom 最小值是0.1
      this.nZoom = this.nZoom - 0.1 > 0.1 ? this.nZoom - 0.1 : this.nZoom;
    },
    // 图片放大
    fnZoomIn() {
      this.nZoom += 0.1;
    },
    // 图片左旋转
    fnRotateLeft() {
      this.nRotate -= 90;
    },
    // 图片右旋转
    fnRotateRight() {
      this.nRotate += 90;
    },
    // 预览图片
    handleImagePreview(url) {
      this.strUrl = url;
      this.nIndex = this.imgUrlList.findIndex(item => item === url);
      this.bVisible = true;
    },
    // 图片下载
    fnImageDownload() {
      downloadFile(this.strUrl, 'pic');
    },
  },
};
</script>

<style lang="scss" scoped>
.image-previewer-wrap {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.7);
  .previewer-button {
    position: fixed;
    cursor: pointer;
  }
  .close-button {
    right: 30px;
    top: 30px;
    width: 28px;
  }
  .next-button {
    right: 20px;
    top: 50%;
  }
  .prev-button {
    left: 20px;
    top: 50%;
  }
  .actions-bar {
    position: fixed;
    bottom: 50px;
    left: 50%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-left: -100px;
    padding: 12px;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.4);
    .prev,
    .next-disable {
      transform: rotate(-180deg);
    }
    .actions-bar-icon {
      width: 30px;
      margin: 0 10px;
      font-size: 24px;
      cursor: pointer;
    }
    .image-counter {
      color: #fff;
    }
  }
}
</style>
