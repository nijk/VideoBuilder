var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var rootPath = path.resolve(__dirname, '../');
var srcPath = path.resolve(rootPath, 'src');
var distPath = path.resolve(rootPath, 'dist');

module.exports = {
  entry: [
    './src/VideoBuilder.js',
  ],
  output: {
    path: distPath,
    publicPath: '/',
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [ srcPath ],
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['es2015'],
            cacheDirectory: true,
            sourceMaps: false
        }
      },
      {
        test: /\.s?css$/,
        loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader!sass-loader'}),
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      srcPath,
      'node_modules'
    ],
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new ExtractTextPlugin({ filename: 'dist/[NAME].css', allChunks: true }),
  ],
};
