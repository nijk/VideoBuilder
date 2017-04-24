var baseConfig = require('./webpack.base');

module.exports = Object.assign({}, baseConfig, {
  devServer: {
    historyApiFallback: true
  }
});
