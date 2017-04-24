var path = require('path');
var baseConfig = require('./webpack.base');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = Object.assign({}, baseConfig, {
  entry: [
    './demo/index.js',
  ],
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    filename: 'demo.js',
  },
  module: {
    rules: [
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
    ],
  },
  /*module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
    ],
  },*/
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: 'demo/index.html'
    }),
  ],
  devServer: {
    historyApiFallback: true
  }
});
