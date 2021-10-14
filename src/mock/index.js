// 首先引入Mock
const Mock = require('mockjs');

// 设置拦截ajax请求的相应时间
Mock.setup({
  timeout: '200-600',
});

let mockArray = [];

// 使用webpack的require.context()遍历所有mock文件
const files = require.context('.', true, /\.js$/);
files.keys().forEach(key => {
  if (key === './index.js') return;
  mockArray = mockArray.concat(files(key).default);
});

// 注册所有的mock服务
mockArray.forEach(item => {
  for (let [path, target] of Object.entries(item)) {
    let protocol = path.split('|');
    Mock.mock(new RegExp('^' + protocol[1]), protocol[0], target);
  }
});

// 注册所有的mock服务
export default { ...mockArray };
