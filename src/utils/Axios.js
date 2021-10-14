import axios from 'axios';
import store from '@/store';
import { Message } from 'element-ui';

class HttpRequest {
  constructor() {
    this.baseUrl = '';
  }

  getInsideConfig() {
    const config = {
      baseURL: this.baseUrl,
      headers: { 'content-type': 'application/json' },
    };
    return config;
  }

  // 请求拦截
  interceptors(instance) {
    instance.interceptors.request.use(
      config => {
        instance.defaults.withCredentials = true;
        instance.defaults.crossDomain = true;
        // 请求头携带token
        let token = store.state.appStore.token;
        console.log(token, 'token');

        token && (config.headers.Authorization = 'Bearer ' + token);
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    //响应拦截
    instance.interceptors.response.use(
      res => {
        //返回数据
        const { data } = res;
        console.log('返回数据处理', res);
        return data;
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  request(options) {
    const instance = axios.create();
    options = Object.assign(this.getInsideConfig(), options);
    this.interceptors(instance);
    return instance(options);
  }
}

const http = new HttpRequest();

function get(url, data = {}) {
  return http.request({
    method: 'GET',
    url,
    data,
  });
}

function post(url, data) {
  return http.request({
    method: 'POST',
    url,
    data,
  });
}
function put(url, data) {
  return http.request({
    method: 'PUT',
    url,
    data,
  });
}

function del(url, data) {
  return http.request({
    method: 'DELETE',
    url,
    data,
  });
}

const axiosAsync = axios.create();
/**
 * 适用于async|await 可返回错误信息 const [err, res] = await requestFunction
 * @param {String}method
 * @param {String}url '请求地址'
 * @param {Object?}params '参数'
 * @param {{ bToken: '是否传token' }?} headers '请求头'
 * @param {Object?}data 'body传参'
 * @returns {Promise<unknown>} [null, res]
 */
export function axiosRequest(method, url, params, headers = {}, data = {}) {
  let token = store.state.appStore.token;
  if (headers?.bToken === undefined || headers?.bToken) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  headers && delete headers.bToken;
  return new Promise(resolve => {
    axiosAsync({
      method,
      url,
      params,
      data,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        ...headers,
      },
    })
      .then(res => {
        resolve([null, res.data]);
      })
      .catch(err => {
        console.log(err);
        Message({
          type: 'warning',
          message: err.message,
        });
        resolve([err, null]);
      });
  });
}
export default { http, get, post, put, delete: del };
