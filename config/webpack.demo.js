var path = require('path');
var baseConfig = require('./webpack.base');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var moduleRules = baseConfig.module.rules.concat([
  {
    test: /\.js$/,
    include: [ path.resolve(__dirname, '../demo') ],
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
      presets: ['es2015'],
      cacheDirectory: true,
      sourceMaps: true
    }
  },
  /*{
    test: /\.html$/,
    loader: 'html-loader'
  },*/
]);

var plugins = baseConfig.plugins.concat([
  new HtmlWebpackPlugin({
    inject: true,
    template: 'demo/index.html'
  })
])

module.exports = Object.assign({}, baseConfig, {
  entry: [
    './demo/index.js'
  ],
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    filename: 'demo.js',
  },
  module: {
    rules: moduleRules,
  },
  plugins: plugins,
  devServer: {
    historyApiFallback: true
  }
});
