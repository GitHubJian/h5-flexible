const root = process.cwd()
const path = require('path')

const pathConfig = {
  static: path.resolve(root, 'static'),
  ico: path.resolve(root, 'lib/images'),
  templatePath: path.resolve(__dirname, 'template.ejs')
}

const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const SpriteSmith = require('webpack-spritesmith')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  target: 'web',
  entry: path.resolve(root, 'lib/js/index.js'),
  output: {
    filename: 'js/[name].js',
    path: pathConfig.static,
    publicPath: '/static/'
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 5,
              name: 'images/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'px2rem-loader',
            options: {
              remUni: 75,
              remPrecision: 8,
              remPrecision: 3
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'px2rem-loader',
            options: {
              remUni: 75,
              remPrecision: 8,
              remPrecision: 3
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
      'process.env.buildTime': JSON.stringify(Date.now())
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    // new SpriteSmith({
    //   src: {
    //     cwd: pathConfig.ico,
    //     glob: '*.png'
    //   },
    //   target: {
    //     image: path.resolve(__dirname, 'src/spritesmith-generated/sprite.png'),
    //     css: path.resolve(__dirname, 'src/spritesmith-generated/sprite.styl')
    //   },
    //   apiOptions: {
    //     cssImageRef: '~sprite.png'
    //   },
    //   spritesmithOptions: {
    //     padding: 2
    //   },
    //   retina: '@2x'
    // }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: pathConfig.templatePath,
      chunks: ['main'],
      title: 'Test',
      inject: 'body'
    }),
    new CleanWebpackPlugin({
      dry: false,
      verbose: false,
      cleanStaleWebpackAssets: true,
      protectWebpackAssets: true,
      cleanOnceBeforeBuildPatterns: ['**/*'],
      cleanAfterEveryBuildPatterns: [],
      dangerouslyAllowCleanPatternsOutsideProject: false
    })
  ],
  optimization: {
    minimizer: [
      new ParallelUglifyPlugin({
        uglifyES: {
          compress: {
            warnings: false,
            drop_console: true
          }
        },
        exclude: ['vendor.js'],
        sourceMap: false
      }),
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g, // 正则表达式，用于匹配需要优化或者压缩的资源名
        cssProcessor: require('cssnano'), // 压缩和优化 CSS 的处理器
        cssProcessorPluginOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true }
            }
          ]
        },
        canPrint: true // 在 console 中打印信息
      })
    ]
  }
}
