import $api from '@/utils/Axios.js';
const BASE_URL = process.env.VUE_APP_API_URL;
const LINGJIANG_BASE_URL = process.env.VUE_APP_LINGJIANG_API_URL;

export default {
  /**
   * 获取领匠学员信息
   * @param {*} id 领匠学员id
   * @returns
   */
  getUserInfo(id) {
    return $api.get(`${LINGJIANG_BASE_URL}/api/studentrelationteacher/studentdetail/${id}?userId=${id}`);
  },

  /**
   * 获取领匠学员IM账号
   * @param {*} id
   * @returns
   */
  getUserIMAccount(id) {
    return $api.get(`${BASE_URL}/v1/student/${id}/chat-accounts`);
  },
};
