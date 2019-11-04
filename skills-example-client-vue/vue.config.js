const path = require('path');
const fs = require('fs');

const resolve = dir => path.join(__dirname, dir);

const getTarget = () => {
  let target = 'http://localhost:8090';
  const proxySslKeyLocation = process.env.WEBPACK_DEV_SERVER_PROXY_TABLE_SSL_KEY_PATH;
  const proxyCertKeyLocation = process.env.WEBPACK_DEV_SERVER_PROXY_TABLE_SSL_CERT_PATH;
  if (fs.existsSync(proxySslKeyLocation) && fs.existsSync(proxyCertKeyLocation)) {
    target = {
      host: 'localhost',
      port: 9443,
      key: fs.readFileSync(proxySslKeyLocation),
      cert: fs.readFileSync(proxyCertKeyLocation),
      protocol: 'https:'
    };
  }
  return target;
};

const proxyConf = {
  target: getTarget(),
  secure: false,
  changeOrigin: true,
  logLevel: 'debug',
};

module.exports = {
  devServer: {
    host: 'localhost',
    port: 8091,
    overlay: true,
    proxy: {
      '/api': proxyConf,
    },
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@$': resolve('src'),
      },
    },
    devtool: 'source-map',
  },
  publicPath: '/vuejs/',
  outputDir: undefined,
  assetsDir: 'static',
  runtimeCompiler: true,
  productionSourceMap: undefined,
  parallel: undefined,
  css: undefined,
};
