const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: ['babel-polyfill', './src/client/index.js'],

  output : {
    path: path.resolve(__dirname, 'dist'),
    filename : '[chunkhash].bundle.js'
  },

  module : {
    rules: [
      {
        test: /\.scss$/,
        use: [
          "style-loader", // creates style nodes from JS strings
          "css-loader", // translates CSS into CommonJS
          "sass-loader" // compiles Sass to CSS
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    },
  },

  devServer: {
    contentBase: path.join(__dirname, "assets"),
    compress: true,
    port: 3000,
    proxy: {
      "/api": "http://localhost:3002",
      "/graphql": "http://localhost:3002",
      "/graphiql": "http://localhost:3002"
    },
    historyApiFallback: true
  },

  plugins: [new HtmlWebpackPlugin()]
}