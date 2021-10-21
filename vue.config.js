const path = require('path');
function resolve(dir) {
  return path.join(__dirname, dir);
}

const outputDir = process.env.VUE_APP_OUTPUT_DIR;

/**
 * 页面中引用的CDN
 */
const configJSCdn = {
  externals: {
    // 不需要打包的依赖模块
    vue: 'Vue',
    'element-ui': 'ELEMENT',
  },
  js: ['//staticdn.lingjiang.com/webstatic/js/vue/vue-2.6.12.min.js', '//staticdn.lingjiang.com/webstatic/js/plugins/elementui/2.15.1/index.js'],
  css: ['//staticdn.lingjiang.com/webstatic/js/plugins/elementui/2.15.1/theme-chalk/index.css'],
};

module.exports = {
  publicPath: './',
  outputDir: outputDir,
  productionSourceMap: process.env.NODE_ENV === 'development',
  configureWebpack: config => {
    config.externals = process.env.NODE_ENV !== 'development' ? configJSCdn.externals : {};
    config.devtool = process.env.NODE_ENV === 'development' ? 'source-map' : '';
  },
  chainWebpack: config => {
    //设置路径别名
    config.resolve.alias.set('@', resolve('src'));
  },
  devServer: {
    open: false,
    // 跨域
    proxy: {
      '/reviewapi': {
        target: 'http://reviewapi.test.lingjiang.com',
        changeOrigin: true,
        pathRewrite: {
          '/reviewapi': '/',
        },
      },
      '/lingjiangapi': {
        target: 'http://plat.test.yswx.cn',
        changeOrigin: true,
        pathRewrite: {
          '/lingjiangapi': '/',
        },
      },
    },
  },
  css: {
    extract: process.env.NODE_ENV !== 'development',
    sourceMap: process.env.NODE_ENV === 'development',
    loaderOptions: {},
    modules: false,
  },
};
