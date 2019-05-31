const path = require('path');

const resolve = dir => path.join(__dirname, dir);

const proxyConf = {
  target: 'http://localhost:8090',
  changeOrigin: false,
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
    devtool: 'cheap-module-eval-source-map',
  },

  outputDir: undefined,
  assetsDir: 'static',
  runtimeCompiler: true,
  productionSourceMap: undefined,
  parallel: undefined,
  css: undefined,
};
