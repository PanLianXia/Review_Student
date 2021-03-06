import $api from '@/utils/Axios.js';
const BASE_URL = process.env.VUE_APP_API_URL;

export default {
  /**
   * 获取回话列表
   * @returns
   */
  getConversationList() {
    return $api.get(`${BASE_URL}/v1/conversations`);
  },
};
