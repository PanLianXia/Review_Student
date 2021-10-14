import { genTestUserSig } from './lib-generate-test-usersig.min';
import TIM from 'tim-js-sdk';
import TIMUploadPlugin from 'tim-upload-plugin';

class TimLib {
  constructor() {
    if (TimLib.instance) {
      return TimLib.instance;
    }
    this.tim = null;
    this.TIM = TIM;
    this.TIMUploadPlugin = TIMUploadPlugin;
    // 将 this 挂载到单例上
    TimLib.instance = this;
    return TimLib.instance;
  }

  /**
   *  初始化Im
   * @param {*} SDKAppID
   */
  init(SDKAppID = '1400563046') {
    if (!SDKAppID) {
      console.error('SDKAppID不可为空');
      return;
    }
    let options = {
      SDKAppID: SDKAppID, // 接入时需要将0替换为您的即时通信 IM 应用的 SDKAppID
    };
    // 创建 SDK 实例，TIM.create() 方法对于同一个 SDKAppID 只会返回同一份实例
    this.tim = this.TIM.create(options); // SDK 实例通常用 tim 表示

    // 设置 SDK 日志输出级别，详细分级请参见 setLogLevel 接口的说明
    this.tim.setLogLevel(0); // 普通级别，日志量较多，接入时建议使用
    // tim.setLogLevel(1); // release 级别，SDK 输出关键信息，生产环境时建议使用

    // 注册腾讯云即时通信IM上传插件
    this.tim.registerPlugin({ 'tim-upload-plugin': this.TIMUploadPlugin });
  }
  /**
   * 获取 userSig, 正常应该从后台获取
   * @param {}  strUserId
   * @param {*} SDKAPPID
   * @param {*} SECRETKEY
   * @returns
   */
  genTestUserSig(strUserId, SDKAPPID, SECRETKEY) {
    let { userSig } = genTestUserSig(strUserId, SDKAPPID, SECRETKEY);
    return userSig;
  }
  /**
   * 登录
   * @returns
  * code: 0
    data:
      a2Key: "9ee22ffa8e5d0655927b3cdf107499741bcaf4381444cfe8ffed5458a71a7ab5dc303dabafe278a93e487ee68814d6222b5d314816c21cde36d2a669ea4101c7d76b117a5b749c4e"
      actionStatus: "OK"
      errorCode: 0
      errorInfo: ""
      helloInterval: 120
      instanceID: 258695522
      timeStamp: 1629771401
      tinyID: "144115261960904706"
   *
   * { code:0,data:{ actionStatus:'OK',errorCode:0,errorInfo:'您已经登录账号administrator！如需切换账号登录，请先调用 logout 接口登出，再调用 login 接口登录。',repeatLogin:true}}
   */
  login(strUserId, strUserSig) {
    if (!strUserId || !strUserSig) {
      console.error('未配置userId或userSig为空');
      return;
    }
    let promise = this.tim.login({ userID: strUserId, userSig: strUserSig });
    return promise;
  }

  /**=========================  消息收发 开始 ================================= */
  /**
   * 创建消息类型
   * @param {String} strTo   接收者
   * @param {*} payload      { text: strSendMessage}
   * @param {*} callProgress 发送图片或文件需要  function (event) {}
   * @returns
   */
  createMessage(strTo, payload, callProgress = null) {
    let options = {
      to: strTo,
      conversationType: this.TIM.TYPES.CONV_C2C,
      payload,
    };
    if (callProgress) {
      options.onProgress = callProgress;
    }
    let message = this.tim.createTextMessage(options);
    return message;
  }
  /**
   * 发送消息
   * @param {*} message ： createMessage()方法创建的消息
   * @returns
   */
  sendMessage(message) {
    let promise = this.tim.sendMessage(message);
    return promise;
  }
  /**========================= 消息收发 结束 ================================= */

  _genUserSig(userID, SDKAPPID = 1400563046, SECRETKEY = 'ae32e0e950d0a11e000c38a6ede2559949640f2f3fd1f5851af53d25004d760e') {
    /**
     * 腾讯云 SDKAppId，需要替换为您自己账号下的 SDKAppId。
     *
     * 进入腾讯云实时音视频[控制台](https://console.cloud.tencent.com/rav ) 创建应用，即可看到 SDKAppId，
     * 它是腾讯云用于区分客户的唯一标识。
     */

    /**
     * 签名过期时间，建议不要设置的过短
     * 时间单位：秒
     * 默认时间：7 x 24 x 60 x 60 = 604800 = 7 天
     */
    var EXPIRETIME = 604800;

    var generator = new window.LibGenerateTestUserSig(SDKAPPID, SECRETKEY, EXPIRETIME);
    var userSig = generator.genTestUserSig(userID);
    return {
      SDKAppID: SDKAPPID,
      userSig: userSig,
    };
  }
}

export default TimLib;
