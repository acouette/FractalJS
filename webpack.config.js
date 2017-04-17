const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const config = {
  entry: {
    app: './app/js/ui/app.js',
    scheduler: './app/js/scheduler/scheduler.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].entry.js',
  },
  module: {
    rules: [
      { test: /\.(eot|woff|woff2|svg|ttf)([\?]?.*)$/, loader: 'file-loader' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'less-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'es2016'],
        }
      }
    ]
  },
  devtool: 'source-map',
  resolve: {
    modules: ['app/js', 'node_modules'],
    alias: {
      'vue$': 'vue/dist/vue.common.js',
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['app'],
      template: './app/html/index.html',
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      chunks: ['scheduler'],
      template: './app/html/scheduler.html',
      filename: 'scheduler.html',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        BROWSER: true,
      },
    }),
  ]
};


module.exports = config;
