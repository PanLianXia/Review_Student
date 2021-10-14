import Mock from 'mockjs';

// var arrConversation = Mock.mock({
//   // 生成2000个元素
//   'list|2000': [
//     {
//       // 属性 id 是一个自增数，起始值为 1，每次增 1
//       'id|+1': 1,
//       dutyTeacher: '@cname', //值班老师
//       avatar: '@image("54x54", "#FF6600")', //头像
//       unread: '@integer(0, 110)', //未读消息
//       nickName: '@cname', //昵称
//       lastMessage: '@cparagraph()', //最后一条消息
//       isTop: '@boolean', //是否置顶
//       sendDate: '@time("HH:mm")',
//       userProfile: {
//         userID: '@integer(1, 10)',
//       },
//     },
//   ],
// });

var im = Mock.mock({
  'list|2': [
    {
      id: '@increment()',
      conversationID: 'C2Cuser3',
      dutyConversationID: 'C2Cuser0', // 值班老师
      unreadCount: '@integer(0, 110)', //未读消息
      type: 'C2C',
      lastMessage: {
        lastTime: function () {
          return Date.parse(Mock.mock('@now')) / 1000;
        },
        lastSequence: 1406430001,
        fromAccount: 'user3',
        messageForShow: '@cparagraph',
        type: 'TIMTextElem',
        payload: {
          text: '@cparagraph',
        },
        cloudCustomData: '',
        isRevoked: false,
        onlineOnlyFlag: false,
      },
      _isInfoCompleted: true,
      peerReadTime: 1630640756,
      groupAtInfoList: [],
      remark: '',
      userProfile: {
        userID: 'user3',
        nick: function () {
          return `2021-user3`;
        },
        gender: '',
        birthday: 0,
        location: '',
        selfSignature: '',
        allowType: 'AllowType_Type_AllowAny',
        language: 0,
        avatar: '@image("54x54", "#FF6600")',
        messageSettings: 0,
        adminForbidType: 'AdminForbid_Type_None',
        level: 0,
        role: 0,
        lastUpdatedTime: 0,
        profileCustomField: [],
      },

      //自定义业务数据
      businessData: {
        //休息老师
        restTeacher: '@cname',
        top: function () {
          return Mock.mock('@increment()') <= 3 ? true : false;
        },
      },
    },
    {
      id: '@increment()',
      conversationID: 'C2Cuser4',
      dutyConversationID: '', // 值班老师
      unreadCount: '@integer(0, 110)', //未读消息
      type: 'C2C',
      lastMessage: {
        lastTime: function () {
          return Date.parse(Mock.mock('@now')) / 1000;
        },
        lastSequence: 1406430001,
        fromAccount: 'user4',
        messageForShow: '@cparagraph',
        type: 'TIMTextElem',
        payload: {
          text: '@cparagraph',
        },
        cloudCustomData: '',
        isRevoked: false,
        onlineOnlyFlag: false,
      },
      _isInfoCompleted: true,
      peerReadTime: 1630640756,
      groupAtInfoList: [],
      remark: '',
      userProfile: {
        userID: 'user4',
        nick: function () {
          return `2021-user4`;
        },
        gender: '',
        birthday: 0,
        location: '',
        selfSignature: '',
        allowType: 'AllowType_Type_AllowAny',
        language: 0,
        avatar: '@image("54x54", "#FF6600")',
        messageSettings: 0,
        adminForbidType: 'AdminForbid_Type_None',
        level: 0,
        role: 0,
        lastUpdatedTime: 0,
        profileCustomField: [],
      },

      //自定义业务数据
      businessData: {
        //休息老师
        restTeacher: '@cname',
        top: function () {
          return Mock.mock('@increment()') <= 3 ? true : false;
        },
      },
    },
  ],
});

console.log(im);

Mock.mock(/\/v1\/conversations/, 'get', options => {
  let list = [...im.list];
  console.log(options, 'options');
  // let { name } = JSON.parse(options?.body);
  // if (name) {
  //   list = list.filter(x => x.nickName.includes(name));
  // }
  return list;
});

export default Mock;
