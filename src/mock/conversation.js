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

Mock.mock(/\/reviewapi\/v1\/conversationTeachers/, 'get', () => {
  return [
    {
      conversationID: 'GROUPmeet_001',
      teacherAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      teacherNick: '张老师',
      reviewTypeName: '论文',
    },
    {
      conversationID: 'GROUP@TGS#3PGXYJQHN',
      teacherAvatar: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201501%2F30%2F20150130180443_QTthA.thumb.700_0.jpeg&refer=http%3A%2F%2Fb-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1636877018&t=e0f65da08b70aaa7ace5f3949b90637e',
      teacherNick: '王老师',
      reviewTypeName: '论文',
    },
    {
      conversationID: 'GROUP@TGS#3ZCW2JQHK',
      teacherAvatar: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.zhimg.com%2F50%2Fv2-82fbd4e910229864eb7b67f1516c7dbd_hd.jpg&refer=http%3A%2F%2Fpic1.zhimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1636877040&t=3178dc4d380427c58d0e5586fc59d1f8',
      teacherNick: '李老师',
      reviewTypeName: '评审',
    },
  ];
});

export default Mock;
