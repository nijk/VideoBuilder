var baseConfig = require('./webpack.base');
var webpack = require('webpack');
var path = require('path');

var rootPath = path.resolve(__dirname, '../');

var plugins = baseConfig.plugins;

if (process.env.NODE_ENV !== 'debug') {
  plugins = baseConfig.plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false,
        drop_console: false,
      }
    }),
  ]);
}

module.exports = Object.assign({}, baseConfig, {
  output: {
    path: rootPath,
    publicPath: '/',
    filename: 'main.js',
    libraryTarget: 'umd',
  },
  plugins: plugins,
});
