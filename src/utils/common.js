import { Message } from 'element-ui';

export function combineConversationData(conversationTeacherList, imConversationList) {
  if (!conversationTeacherList || conversationTeacherList.length < 1) {
    Message.error('暂无老师为您服务');
    return;
  }
  let conversationData = {};
  conversationTeacherList.forEach(conversationTeacherItem => {
    if (!conversationData[conversationTeacherItem.reviewTypeName]) {
      conversationData[conversationTeacherItem.reviewTypeName] = [];
    }
  });
  imConversationList.forEach(imConversationItem => {
    let conversationTeacher = conversationTeacherList.find(conversationTeacherItem => imConversationItem.conversationID === conversationTeacherItem.conversationID);
    if (!conversationTeacher) return;
    imConversationItem.teacherAvatar = conversationTeacher.teacherAvatar;
    imConversationItem.teacherNick = conversationTeacher.teacherNick;
    imConversationItem.reviewTypeName = conversationTeacher.reviewTypeName;

    conversationData[imConversationItem.reviewTypeName].push(imConversationItem);
  });
  return conversationData;
}
