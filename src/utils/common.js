export function combineConversationData(conversationTeacherList, imConversationList) {
  if (!conversationTeacherList || conversationTeacherList.length < 1) return;

  let conversationData = {};
  conversationTeacherList.forEach(conversationTeacherItem => {
    if (!conversationData[conversationTeacherItem.reviewType]) {
      conversationData[conversationTeacherItem.reviewType] = [];
    }
  });
  // conversationData['其他分类'] = [];

  imConversationList.forEach(imConversationItem => {
    let conversationTeacher = conversationTeacherList.find(conversationTeacherItem => imConversationItem.conversationID === conversationTeacherItem.groupId);
    if (!conversationTeacher) {
      // conversationData['其他分类'].push(imConversationItem);
      return;
    }

    imConversationItem.teacherHeadPortrait = conversationTeacher.teacherHeadPortrait;
    imConversationItem.teacherNickName = conversationTeacher.teacherNickName;
    imConversationItem.reviewType = conversationTeacher.reviewType;
    conversationData[conversationTeacher.reviewType].push(imConversationItem);
  });
  return conversationData;
}
