import $api from '@/utils/Axios.js';
const BASE_URL = process.env.VUE_APP_API_URL;

export default {
  /**
   * 获取聊天登录信息(AppID,userSig)
   * @returns
   */
  getIMConfig(chatAccount) {
    return $api.get(`${BASE_URL}/v1/im/users/${chatAccount}/usersig-with-configs`);
  },
};
