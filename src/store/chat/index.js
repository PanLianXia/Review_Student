import { Message } from 'element-ui';

/**
 *  即时聊天
 */
const state = {
  currentUserProfile: {},
  currentConversation: {},
  currentMessageList: [],
  conversationData: {},
  conversationTeacherList: [], // 会话列表老师信息
  nextReqMessageID: '',
  isCompleted: false, // 当前会话消息列表是否已经拉完了所有消息
};

const getters = {
  // 用于当前会话的图片预览
  imgUrlList: state => {
    return state.currentMessageList
      .filter(message => message.type === window.$timLib.TIM.TYPES.MSG_IMAGE && !message.isRevoked) // 筛选出没有撤回并且类型是图片类型的消息
      .map(message => message.payload.imageInfoArray[0].imageUrl);
  },
  // 消息接收者
  toAccount: state => {
    if (!state.currentConversation || !state.currentConversation.conversationID) {
      return '';
    }
    switch (state.currentConversation.type) {
      case window.$timLib.TIM.TYPES.CONV_C2C:
        return state.currentConversation.conversationID.replace('C2C', '');
      case window.$timLib.TIM.TYPES.CONV_GROUP:
        return state.currentConversation.conversationID.replace('GROUP', '');
      default:
        return state.currentConversation.conversationID;
    }
  },
};

// mutations
const mutations = {
  updateConversationTeacherList(state, conversationTeachers) {
    state.conversationTeacherList = conversationTeachers;
  },
  updateCurrentUserProfile(state, userProfile) {
    state.currentUserProfile = userProfile;
  },
  /**
   * 将消息插入当前会话列表
   * 调用时机：收/发消息事件触发时
   * @param {Object} state
   * @param {Message[]|Message} data
   * @returns
   */
  pushCurrentMessageList(state, data) {
    // 还没当前会话，则跳过
    if (!state.currentConversation.conversationID) {
      return;
    }
    if (Array.isArray(data)) {
      // 筛选出当前会话的消息
      const result = data.filter(item => item.conversationID === state.currentConversation.conversationID);
      state.currentMessageList = [...state.currentMessageList, ...result];
      // filterCallingMessage(state.currentMessageList);
    } else if (data.conversationID === state.currentConversation.conversationID) {
      state.currentMessageList = [...state.currentMessageList, data];
      // filterCallingMessage(state.currentMessageList);
    }
  },
  /**
   * 更新会话列表
   * 调用时机：触发会话列表更新事件时。CONVERSATION_LIST_UPDATED
   * @param {Conversation[]} conversationData
   */
  updateConversationData(state, conversationData) {
    state.conversationData = conversationData;
  },
  /**
   * 更新当前会话
   * 调用时机: 切换会话时
   * @param {Conversation} conversation
   */
  updateCurrentConversation(state, conversation) {
    state.currentConversation = conversation;
    state.currentMessageList = [];
    state.nextReqMessageID = '';
    state.isCompleted = false;
  },
};
const actions = {
  /**
   * 获取消息列表
   * 调用时机：打开某一会话时或下拉获取历史消息时
   * @param {Object} context
   * @param {String} conversationID
   */
  getMessageList(context, conversationID) {
    if (context.state.isCompleted) {
      Message({
        message: '已经没有更多的历史消息了哦!',
        type: 'info',
      });
      return;
    }
    const { nextReqMessageID, currentMessageList } = context.state;
    // TODO 如果是服务老师，则筛选去掉值班老师的聊天记录；如果是值班老师获取的是服务老师与该学员的聊天记录（目前应该不会出现这种情况）
    window.$timLib.tim.getMessageList({ conversationID, nextReqMessageID, count: 15 }).then(imReponse => {
      // 更新messageID，续拉时要用到
      context.state.nextReqMessageID = imReponse.data.nextReqMessageID;
      context.state.isCompleted = imReponse.data.isCompleted;
      // 更新当前消息列表，从头部插入
      context.state.currentMessageList = [...imReponse.data.messageList, ...currentMessageList];
      // filterCallingMessage(context.state.currentMessageList);
    });
  },
  /**
   * 切换会话
   * 调用时机：切换会话时
   * @param {Object} context
   * @param {String} conversationID
   */
  checkoutConversation(context, conversation) {
    // if (context.state.currentConversation.conversationID !== conversationID) {
    // 1.切换会话前，将切换前的会话进行已读上报
    if (context.state.currentConversation.conversationID) {
      const prevConversationID = context.state.currentConversation.conversationID;
      window.$timLib.tim.setMessageRead({ conversationID: prevConversationID });
    }
    console.log('window.$timLib.tim.setMessageRead', window.$timLib.tim.setMessageRead);
    // 2.待切换的会话也进行已读上报(包括服务老师和值班老师)
    window.$timLib.tim.setMessageRead({ conversationID: conversation.conversationID });
    if (conversation.dutyConversationID) {
      window.$timLib.tim.setMessageRead({ conversationID: conversation.dutyConversationID });
    }
    // 3. 获取会话信息
    return window.$timLib.tim.getConversationProfile(conversation.conversationID).then(({ data }) => {
      // 3.1 更新当前会话(TODO 需要有值班老师信息 eg: 设置已读)
      // data.conversation.dutyConversationID = 'C2Cuser0';
      context.commit('updateCurrentConversation', data.conversation);
      // 3.2 初始化获取消息参数
      context.state.nextReqMessageID = '';
      context.state.isCompleted = false;
      // 3.3 获取消息列表
      context.dispatch('getMessageList', conversation.conversationID);
      return Promise.resolve();
    });
    // }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
