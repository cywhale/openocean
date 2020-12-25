import webpack from 'webpack';
import path from 'path';
// Plugins for webpack
// new release: https://github.com/CesiumGS/cesium-webpack-example/blob/master/webpack.release.config.js
// https://cesium.com/docs/tutorials/cesium-and-webpack/
import CopyWebpackPlugin from 'copy-webpack-plugin';
//const ExtractTextPlugin = require('extract-text-webpack-plugin');
//const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const autoprefixer = require('autoprefixer');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const ManifestPlugin = require('webpack-manifest-plugin');
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
//const AssetsPlugin = require('assets-webpack-plugin'); //dev
//https://medium.com/@poshakajay/heres-how-i-reduced-my-bundle-size-by-90-2e14c8a11c11
//https://gist.github.com/AjayPoshak/e41ec36d28437494d10294256e248bc6
//const BrotliPlugin = require('brotli-webpack-plugin');
//const BrotliGzipPlugin = require('brotli-gzip-webpack-plugin');
//https://github.com/webpack-contrib/compression-webpack-plugin
const CompressionPlugin = require('compression-webpack-plugin');
//const zlib = require('zlib');

const tryOptimize = false;
const OptimizePlugin = require('optimize-plugin'); //cannot work with copy-webpack-plugin

// Cesium
const cesiumSource = "../node_modules/cesium/Source";
const cesiumWorkers = "../Build/Cesium/Workers";
// mode
const testenv = {NODE_ENV: process.env.NODE_ENV};
// const paths = require("./paths");
const publicPath= "./";
const publicUrl = publicPath.slice(0, -1);

//const cssFilename = '[name].[contenthash:8].css'; //'static/css/'
//const extractTextPluginOptions = { publicPath: Array(cssFilename.split('/').length).join('../') }

const globOptions = {};
        //nodir : true,
        //cwd : "node_modules/cesium/Build/Cesium/",
        //ignore: ["*Cesium.js", "**/NaturalEarthII/**/*", "**/maki/**/*", "**/IAU2006_XYS/**/*"]
      //};
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

//https://github.com/preactjs/preact-cli/blob/81c7bb23e9c00ba96da1c4b9caec0350570b8929/src/lib/webpack/webpack-client-config.js

const cesium_other_config = (config, env) => {

  var entryx;

  if (tryOptimize) {
    var optzx = {
       usedExports: true,
       runtimeChunk: true, //'single'
       concatenateModules: true,
    }
    if (testenv.NODE_ENV !== "production") {
      optzx = {
         ...optzx,
         minimizer:
         [
           new TerserPlugin({
             cache: true,
             parallel: true,
             sourceMap: true,
             terserOptions: {
                compress: { drop_console: true },
                output: { comments: false }
             },
             extractComments: false
           })
        ]
      }
    }
  } else {
    var optzx = {
       usedExports: true,
       runtimeChunk: true, //'single'
       concatenateModules: true,
       minimizer:
       [
         new TerserPlugin({
             cache: true,
             parallel: true,
             sourceMap: true,
             terserOptions: {
                compress: { drop_console: true },
                output: { comments: false }
             }, //https://github.com/preactjs/preact-cli/blob/master/packages/cli/lib/lib/webpack/webpack-clien$
             extractComments: false //{
               //filename: (fileData) => {
               //  return `${fileData.filename}.OTHER.LICENSE.txt${fileData.query}`;
               //}
             //}
         })
      ]
    };
  }
  var outputx = {
      filename: '[name].[chunkhash:8].js', //'static/js/'
      sourceMapFilename: '[name].[chunkhash:8].map',
      chunkFilename: '[name].[chunkhash:8].chunk.[id].js',
      publicPath: publicPath,
      //path: path.resolve(__dirname, 'build'),
      //Needed to compile multiline strings in Cesium
      sourcePrefix: ''
  };


  if (testenv.NODE_ENV === "production") {
    console.log("Node env in production...");
    config.devtool = false; //'source-map'; //if not use sourceMap, set false
    entryx = [
      //require.resolve('./polyfills'),
      './src/index.js'
    ];
    outputx = {...outputx,
      path: path.resolve(__dirname, 'build')
    };

  } else {
    console.log("Node env in development...");

    entryx = [
      'webpack-dev-server/client?https://0.0.0.0:3000/',
      //https://github.com/webpack/webpack-dev-server/issues/416
      //'webpack-dev-server/client?https://' + require("ip").address() + ':3000/',
      './src/index.js'
    ];
    outputx = {
      ...outputx,
      path: path.resolve(__dirname, 'dist')
    };
  }

  return {
    //mode: prod ? "production" : "development",
    //externals: {
      //cesium: "Cesium",
    //},
    context: __dirname,
    entry: entryx,
    output: outputx, /*{
        filename: '[name].[chunkhash:8].js', //'static/js/'
        sourceMapFilename: '[name].[chunkhash:8].map',
        chunkFilename: '[name].[chunkhash:8].chunk.[id].js',
        publicPath: publicPath,
        path: path.resolve(__dirname, 'build'),
        // Needed to compile multiline strings in Cesium
        sourcePrefix: ''
    },*/
    //https://blog.isquaredsoftware.com/2017/03/declarative-earth-part-1-cesium-webpack/#including-cesium-in-production
    unknownContextCritical : false,
    amd: {
      // Enable webpack-friendly use of require in Cesium
      toUrlUndefined: true
    },
    node: {
      // Resolve node module use of fs
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      Buffer: false,
      http: "empty",
      https: "empty",
      //zlib: "empty"
    },
    resolve: {
      fallback: path.resolve(__dirname, '..', 'src'),
      extensions: ['.js', '.json', '.jsx', ''],
      mainFields: ['module', 'main'],
      alias: {
        cesium: path.resolve(__dirname, cesiumSource),
        "react": "preact-compat",
        "react-dom": "preact-compat"
      }
    },
    module: { //https://github.com/CesiumGS/cesium/issues/8401
        // Removes these errors: "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted"
        // https://github.com/AnalyticalGraphicsInc/cesium-webpack-example/issues/6
        unknownContextCritical: false,
        unknownContextRegExp: /\/cesium\/cesium\/Source\/Core\/buildModuleUrl\.js/,
        rules: [
        { test: /cesium\.js$/, loader: 'script' },
        { //https://github.com/storybookjs/storybook/issues/1493
            test: /\.(js|jsx)$/,
            exclude: [/bower_components/, /node_modules/, /styles/],
	    loader: 'babel-loader',
	    //include: path.resolve(__dirname, '../../src')
        },
        {
            test: /\.(css|scss)$/,
            use: [//{
                //loader: MiniCssExtractPlugin.loader,
              //},//ExtractTextPlugin.extract(
              //'style-loader',
              //'css?importLoaders=1!postcss',
                { loader: 'style-loader' },
                { loader: 'css-loader' },
                { loader: 'sass-loader' }
              //{ loader: 'css-loader' }
            ],
            include: /node_modules[/\\]react-dropdown-tree-select/,
            sideEffects: true
            // extractTextPluginOptions
            // )
        }, {
            test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
            use: [ 'url-loader' ],
            //name: 'static/media/[name].[hash:8].[ext]'
        }, /*{
            test: /\.js$/, //\.worker\
            use: {
              loader: 'workerize-loader',
              options: {
                inline: true
              }
            }
        },*/
        {
// Remove pragmas https://github.com/CesiumGS/cesium-webpack-example/blob/master/webpack.release.config.js
          test: /\.js$/,
          enforce: 'pre',
          include: path.resolve(__dirname, '../node_modules/cesium/Source'),
          sideEffects: false,
          use: [{
               loader: 'strip-pragma-loader',
               options: {
                 pragmas: {
                   debug: false
                 }
               }
          }]
        }
        ]
    },
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      https: true,
      host : '0.0.0.0',
      //host: 'localhost',
      port: 3000,
      proxy: {
	'**': {
          target: 'https://0.0.0.0:3000',
          // context: () => true, //https://webpack.js.org/configuration/dev-server/#devserverproxy
          changeOrigin: true
        }
      },
      hot: true,
      //sockjsPrefix: '/assets',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      },
      historyApiFallback: {
        disableDotRule: true
      },
      public : 'eco.odb.ntu.edu.tw',
      publicPath: '/',
      disableHostCheck: true,
      quiet: true,
      inline: true,
      compress: true
    }, /* https://bit.ly/3fkiypj
    postcss: function() {
      return [
        autoprefixer({
          browsers: [
            '>1%',
            'last 4 versions',
            'Firefox ESR',
            'not ie < 9', // React doesn't support IE8 anyway
          ]
        }),
      ];
    },*/
//https://github.com/CesiumGS/cesium-webpack-example/issues/7
    optimization: {
      ...optzx,
      splitChunks: {
        //name: 'vendors',
        chunks: "all",
        maxInitialRequests: Infinity,
	//minSize: 0,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            chunks: 'initial',
            name: `chunk-vendors` //(module) {
              // get the name. E.g. node_modules/packageName/not/this/part.js
              // or node_modules/packageName
              //const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              // npm package names are URL-safe, but some servers don't like @ symbols
              //return `npm.${packageName.replace('@', '')}`;
            //},
          },// https://blog.logrocket.com/guide-performance-optimization-webpack/
          commons: {
            name: 'Cesium',
            test: /[\\/]node_modules[\\/]cesium/,
            //minSize: 10000,
            //maxSize: 300000,
            chunks: 'all'
          }
        }
      }
    }
    // you can add preact-cli plugins here
    //plugins: [
        //https://github.com/preactjs/preact-cli/wiki/Config-Recipes
        //config.plugins.push( new CopyWebpackPlugin([{ context: `${__dirname}/assets`, from: `*.*` }]) );
        // https://resium.darwineducation.com/installation1https://resium.darwineducation.com/installation1
    //  ],
  };
}

//module exports = {
const baseConfig = (config, env) => {
  if (!config.plugins) {
        config.plugins = [];
  }

// transform https://github.com/webpack-contrib/copy-webpack-plugin/issues/6
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
      {
        from: path.join(cesiumSource, cesiumWorkers), //__dirname,
        to: "Workers", //path.join(__dirname, "Workers"),
      },
      {
        from: path.join(cesiumSource, "Assets"), //__dirname,
        to: "Assets", //path.join(__dirname, "Assets"),
        globOptions: globOptions,
      },
      {
        from: path.join(cesiumSource, "Widgets"), //__dirname,
        to: "Widgets", //path.join(__dirname, "Widgets"),
      },
      { from: path.join(cesiumSource, 'ThirdParty'),
        to: 'ThirdParty',
      }
      ]
    })
  );

  config.plugins.push(
    new webpack.DefinePlugin({
       // Define relative base path in cesium for loading assets
       CESIUM_BASE_URL: JSON.stringify('')
    })
  );

  if (testenv.NODE_ENV === "production") {

    if (tryOptimize) {
      console.log("!!Use LESS html-webpack-plugin args!!");
      config.plugins.push(
        new HtmlWebpackPlugin({
           template: 'template.html',
           production : true,
           inject: false,
           cache: false,
           minify: false,
        })
      );
    } else {
      console.log("Use more html-webpack-plugin args");
      config.plugins.push(
        new HtmlWebpackPlugin({
           template: 'template.html',
           production : true,
           inject: true,
          minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true
          }
        })
      );
    }

// see https://github.com/webpack-contrib/compression-webpack-plugin
// can replace BrotliPlugin and BrotliGzipPlugin
    config.plugins.push(
	//new BrotliPlugin({
        new CompressionPlugin({
	  filename: '[path][base].br', //asset: '[path].br[query]'
          algorithm: 'brotliCompress', //for CompressionPlugin
          deleteOriginalAssets: false, //for CompressionPlugin
	  test: /\.(js|css|html|svg)$/,
          compressionOptions: {
            // zlib’s `level` option matches Brotli’s `BROTLI_PARAM_QUALITY` option.
            level: 11,
          },
	  threshold: 10240,
	  minRatio: 0.8
	})
    );
    config.plugins.push(
        //new BrotliGzipPlugin({
        new CompressionPlugin({
          filename: '[path][base].gz', //asset: '[path].gz[query]'
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8
        })
    );

// https://blog.isquaredsoftware.com/2017/03/declarative-earth-part-1-cesium-webpack/
/*
    config.plugins.push(
      new webpack.DllReferencePlugin({
        context : cesiumSource, //paths.cesiumSourceFolder,
        manifest: require(path.join(__dirname, "..", "distdll/cesiumDll-manifest.json")),
      })
    );
*/
    config.plugins.push( new webpack.optimize.OccurrenceOrderPlugin() );
    config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    config.plugins.push(new webpack.NoEmitOnErrorsPlugin());
    // Try to dedupe duplicated modules, if any:
    config.plugins.push( new DuplicatePackageCheckerPlugin() );
    //config.plugins.push( new ExtractTextPlugin(cssFilename) );
    //config.plugins.push( new ManifestPlugin({
    //  fileName: 'asset-manifest.json'
    //}));

    if (tryOptimize) {
      config.plugins.push( new OptimizePlugin({
        concurrency: 8,
        sourceMap: false,
        minify: true,
        modernize:false
      }));
    }
    config.plugins.push( new BundleAnalyzerPlugin({
      analyzerMode: 'static', //disabled
      generateStatsFile: true,
      statsOptions: { source: false }
    }));
  }

  //config.plugins.push( new MiniCssExtractPlugin()); //{extractTextPluginOptions}) );
  //    filename: cssFilename
  //}) );
/*
  config.plugins.push( new BundleAnalyzerPlugin({
      analyzerMode: 'static', //disabled
      generateStatsFile: true,
      statsOptions: { source: false }
  }));
*/
  return config;
};

//module exports = {
export default (config, env) => {
  return merge(
    baseConfig(config, env),
    cesium_other_config(config, env)
  );
};
