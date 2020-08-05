import webpack from 'webpack';
import path from 'path';
// Plugins for webpack
// https://cesium.com/docs/tutorials/cesium-and-webpack/
import CopyWebpackPlugin from 'copy-webpack-plugin';
//const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const autoprefixer = require('autoprefixer');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const ManifestPlugin = require('webpack-manifest-plugin');
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
// Cesium
const cesiumSource = "../node_modules/cesium/Source";
const cesiumWorkers = "../Build/Cesium/Workers";
// mode
const testenv = {NODE_ENV: process.env.NODE_ENV};
// const paths = require("./paths");
const publicPath= "./";
const publicUrl = publicPath.slice(0, -1);
const cssFilename = '[name].[contenthash:8].css'; //'static/css/'

const extractTextPluginOptions = { publicPath: Array(cssFilename.split('/').length).join('../') }
const globOptions = {};
        //nodir : true,
        //cwd : "node_modules/cesium/Build/Cesium/",
        //ignore: ["*Cesium.js", "**/NaturalEarthII/**/*", "**/maki/**/*", "**/IAU2006_XYS/**/*"]
      //};
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


//https://github.com/preactjs/preact-cli/blob/81c7bb23e9c00ba96da1c4b9caec0350570b8929/src/lib/webpack/webpack-client-config.js
const cesium_other_config = (config, env) => {
  var entryx;
  var outputx = {
        filename: '[name].[chunkhash:8].js', //'static/js/'
        sourceMapFilename: '[name].[chunkhash:8].map',
        chunkFilename: '[name].[chunkhash:8].chunk.[id].js',
        publicPath: publicPath,
        //path: path.resolve(__dirname, 'build'),
        // Needed to compile multiline strings in Cesium
        sourcePrefix: ''
  };

  if (testenv.NODE_ENV === "production") {
    console.log("Node env in production...");
    config.devtool = false;
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
      'webpack-dev-server/client?https:0.0.0.0:3000/',
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
      tls: 'empty'
    },
    resolve: {
      fallback: path.resolve(__dirname, '..', 'src'),
      extensions: ['.js', '.json', '.jsx', ''],
      alias: {
        cesium: path.resolve(__dirname, cesiumSource),
        //"react": "preact-compat",
        //"react-dom": "preact-compat"
      }
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [{
                loader: MiniCssExtractPlugin.loader,
              },//ExtractTextPlugin.extract(
              'style-loader',
              'css?importLoaders=1!postcss',
              'css-loader' ]
              // extractTextPluginOptions
              // )
        }, {
            test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
            use: [ 'url-loader' ],
            //name: 'static/media/[name].[hash:8].[ext]'
        }, /*{
            test: /\.worker\.js$/,
            use: {
              loader: 'worker-loader',
              options: {
                inline: true
              }
            },
        },*/
        {
          // Remove pragmas
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
      port: 3000,
      proxy: {
	'**': 'http://0.0.0.0:3000'
      },
      hot: true,
      sockjsPrefix: '/assets',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      },
      historyApiFallback: {
        disableDotRule: true
      },
      public : 'eco.odb.ntu.edu.tw',
      host : '0.0.0.0',
      disableHostCheck: true,
      quiet: true,
      inline: true,
      compress: true
    }, // https://bit.ly/3fkiypj
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
    },
//https://github.com/CesiumGS/cesium-webpack-example/issues/7
    optimization: {
       usedExports: true,
       runtimeChunk: true, //'single'
       minimizer:
       [
         new TerserPlugin({
             cache: true,
             parallel: true,
             sourceMap: true,
             terserOptions: {
                compress: { drop_console: true },
		output: { comments: false }
             }, //https://github.com/preactjs/preact-cli/blob/master/packages/cli/lib/lib/webpack/webpack-client-config.js
             extractComments: false //{
               //filename: (fileData) => {
               //  return `${fileData.filename}.OTHER.LICENSE.txt${fileData.query}`;
               //}
             //}
         })
      ],
      splitChunks: {
        //name: 'vendors',
        chunks: "all",
        maxInitialRequests: Infinity,
	minSize: 0,
        cacheGroups: {
        /*preactBase: {
            name: 'preactBase',
            test: (module) => {
              return /preact|prop-types/.test(module.context);
            },
            chunks: 'pre',
            priority: 10,
          },*/
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
          },
          commons: {
            name: 'Cesium',
            test: /[\\/]node_modules[\\/]cesium/,
            //maxSize: 200000,
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

  if (testenv.NODE_ENV === "production") {
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
    // Try to dedupe duplicated modules, if any:
    config.plugins.push( new DuplicatePackageCheckerPlugin() );
    //config.plugins.push( new ExtractTextPlugin(cssFilename) );
    //config.plugins.push( new ManifestPlugin({
    //  fileName: 'asset-manifest.json'
    //}));
    config.plugins.push( new BundleAnalyzerPlugin({
      analyzerMode: 'static', //disabled
      generateStatsFile: true,
      statsOptions: { source: false }
    }));
  }

  config.plugins.push( new MiniCssExtractPlugin({extractTextPluginOptions}) );

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
        globOptions: globOptions
      },
      {
        from: path.join(cesiumSource, "Widgets"), //__dirname,
        to: "Widgets", //path.join(__dirname, "Widgets"),
      },
      { from: path.join(cesiumSource, 'ThirdParty'),
        to: 'ThirdParty'
      }/*,
      { from: path.join('..', 'distdll/cesiumDll.js'),
        to: 'cesium'
      }*/
      ]
    })
  );

  config.plugins.push(
    new webpack.DefinePlugin({
       // Define relative base path in cesium for loading assets
       CESIUM_BASE_URL: JSON.stringify('')
    })
  );
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
