const state = {
  token: '',
};

// mutations
const mutations = {
  setToken(state, payload) {
    state.token = payload;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
