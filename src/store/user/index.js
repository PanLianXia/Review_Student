const state = {
  userInfo: {},
};

const mutations = {
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
