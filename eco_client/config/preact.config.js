import webpack from 'webpack';
import path from 'path';
// const glob = require('glob');
// Plugins for webpack
// new release: https://github.com/CesiumGS/cesium-webpack-example/blob/master/webpack.release.config.js
// https://cesium.com/docs/tutorials/cesium-and-webpack/
import CopyWebpackPlugin from 'copy-webpack-plugin';
//const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
//const ExtractTextPlugin = require('extract-text-webpack-plugin'); //deprecated, not support more
//const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const autoprefixer = require('autoprefixer');
const { merge } = require('webpack-merge');
//const terser = require("terser");
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
//const OptimizeCssAssetsPlugin= require('optimize-css-assets-webpack-plugin'); //seems CssMinimizerWebpackPlugin replace it
//const PreloadWebpackPlugin = require('preload-webpack-plugin'); //('@vue/preload-webpack-plugin');
//const Critters = require('critters-webpack-plugin');
//const HtmlCriticalWebpackPlugin = require("html-critical-webpack-plugin");
//const zlib = require('zlib');
const svgToMiniDataURI = require('mini-svg-data-uri');
//const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
//const PurgecssPlugin = require('purgecss-webpack-plugin');
//const jsonminify= require('jsonminify');
//const UnusedFilesPlugin = require('unused-files-webpack-plugin').default;
//const preactCliSwPrecachePlugin = require('preact-cli-sw-precache'); //not work anymore? https://github.com/preactjs/preact-cli/pull/674
//const WorkboxPlugin = require("workbox-webpack-plugin");
//const {InjectManifest} = require('workbox-webpack-plugin');

// Q/A here: https://app.slack.com/client/T3NM0NCDC/C3PSVEMM5/thread/C3PSVEMM5-1616340858.005300
// Workbox configuration options: [maximumFileSizeToCacheInBytes]. This will not have any effect, as it will only modify files that are matched via 'globPatterns'
// replace files
// cp ~/backup/openocean/ver_bak/preact-cli-workbox-plugin/replace-default-plugin.js /home/odbadmin/git/openocean/eco_client/node_modules/preact-cli-workbox-plugin/
//const { injectManifest, swGenerator } = require('preact-cli-workbox-plugin');

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
//const PATHS = {
//  src: path.join(__dirname, 'src')
//};

const globOptions = {};
        //nodir : true,
        //cwd : "node_modules/cesium/Build/Cesium/",
        //ignore: ["*Cesium.js", "**/NaturalEarthII/**/*", "**/maki/**/*", "**/IAU2006_XYS/**/*"]
      //};

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

//https://github.com/preactjs/preact-cli/blob/81c7bb23e9c00ba96da1c4b9caec0350570b8929/src/lib/webpack/webpack-client-config.js

if (typeof XMLHttpRequest === 'undefined') {
  global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
}

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
                //ecma: 9,
                compress: { drop_console: true },
                output: { comments: false }
             },
             extractComments: false
           })
        ]
      }
    }
  } else {
    console.log("Use production optimization...");
    var optzx = {
       usedExports: true,
       //https://wanago.io/2018/08/13/webpack-4-course-part-seven-decreasing-the-bundle-size-with-tree-shaking/
       //sideEffects: true, //tell Webpack don't ignore package.json sideEffect = false settings
       runtimeChunk: true, //{
         //name: 'runtime'
       //},
       concatenateModules: true,
       minimizer:
       [
         new TerserPlugin({
             cache: true,
             parallel: true,
             sourceMap: true,
             terserOptions: {
                compress: { dead_code: true, drop_console: true, passes: 2 },
                output: { comments: false }
             }, //https://github.com/preactjs/preact-cli/blob/master/packages/cli/lib/lib/webpack/webpack-clien$
             extractComments: false //{
               //filename: (fileData) => {
               //  return `${fileData.filename}.OTHER.LICENSE.txt${fileData.query}`;
               //}
             //}
         })/*,
         new OptimizeCssAssetsPlugin({
           cssProcessorOptions: {
             //Fix keyframes in different CSS chunks minifying to colliding names:
               reduceIdents: false,
               safe: true,
               discardComments: {
                 removeAll: true
               }
           }
         })*/
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
      'webpack-dev-server/client?https://0.0.0.0/',
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
      extensions: ['.js', '.jsx'], //'.json', ''
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
        //{ test: /cesium\.js$/, loader: 'script' },
        { //https://github.com/storybookjs/storybook/issues/1493
            test: /\.(js|jsx)$/,
            exclude: /node_modules/, //[/bower_components/, /styles/]
	    loader: 'babel-loader',
            options: {
              presets: [
                ['env', {
                  modules: false,
                  useBuiltIns: true,
                  targets: {
                    browsers: [
                      'Chrome >= 60',
                      'Safari >= 10.1',
                      'iOS >= 10.3',
                      'Firefox >= 54',
                      'Edge >= 15',
                    ],
                  },
                }],
              ],
            }
	    //include: path.resolve(__dirname, '../../src')
        }, {
          test: /\.svg$/i,
          use: [{
            loader: 'url-loader',
            options: {
              generator: (content) => svgToMiniDataURI(content.toString()),
            },
          }],
        },
        { /*
            test: /\.json$/i,
            exclude: /node_modules/,
            use: ['raw-loader'],
        },
          test: /200.html$/,
          use: [ 'file-loader' ]
        }, {*/
            test: /\.(png|gif|jpg|jpeg|xml|json)$/, //|svg
            use: [{ loader: 'url-loader',
                    options: { limit: 30 * 1024 }
            }]
            //name: 'assets/[name].[hash:8].[ext]'
        },
        {
          test: /\.(jpe?g|png|gif|svg|webp)$/i,
          type: 'asset',
        },
 /*     {
          test: /\.(jpe?g|png|gif|svg|webp)$/i,
          use: [
            {
              loader: ImageMinimizerPlugin.loader,
              include: /\/(assets|node_modules[\\/]cesium[\\/]Source[\\/]Assets[\\/](Textures|SkyBox))/,
              filter: (source, sourcePath) => {
                if (source.byteLength < 8192) {
                  return false;
                }
                return true;
              },
              options: {
                severityError: 'warning',
                minimizerOptions: {
                  plugins: [
                    ['jpegtran', { progressive: true }],
                    ['optipng', { optimizationLevel: 5 }],
                    ['gifsicle', { interlaced: true, optimizationLevel: 3 }],
                    ['imagemin-svgo', {plugins: [{removeViewBox: false}] }],
                    ['imagemin-webp']
                  ],
                },
              },
            },
          ],
        },*/
        {
            test: /\.(css|scss)$/,
            exclude: /(node_modules)/,
            use: [
              //ExtractTextPlugin.extract({ use:['style-loader', 'css-loader', 'sass-loader'] }),
              //'css?importLoaders=1!postcss',
              //MiniCssExtractPlugin.loader, 'style-loader', 'css-loader', 'sass-loader'
              /*{
                loader: MiniCssExtractPlugin.loader, //ExtractCssChunks.loader,
                options: {
                  publicPath: '/assets/css/',
                },
              },*/
              { loader: 'style-loader' },
              { loader: 'css-loader?modules&importLoaders=1', //https://jasonformat.com/how-css-modules-work-today
                options: {
                   minimize: true
                }
              },
              { loader: 'sass-loader' }
            ].join('!'),
            include: /node_modules[/\\]react-dropdown-tree-select/,
            sideEffects: true
            // extractTextPluginOptions
            // )
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
      hot: true,
      //sockjsPrefix: '/assets',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      },
      historyApiFallback: {
        disableDotRule: true
      },
      //public : 'eco.odb.ntu.edu.tw',
      publicPath: '/',
      disableHostCheck: true,
      quiet: true,
      inline: true,
      compress: true,
      sockHost: '0.0.0.0',
      sockPort: 3004,
      sockPath: '/serve/sockjs-node',
      proxy: {
        "/serve": {
            target: "https://eco.odb.ntu.edu.tw/",
            pathRewrite: { "^/serve": "/sockjs-node" },
            changeOrigin: true,
        },
        '**': {
          target: 'https://0.0.0.0/',
          // context: () => true, //https://webpack.js.org/configuration/dev-server/#devserverproxy
          changeOrigin: true
        }
      }
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
        name: false, //https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
        chunks: "all",
        minSize: 100000,
        //maxSize: 200000,
        maxAsyncRequests: 20,
        maxInitialRequests: Infinity,
        reuseExistingChunk: true,
        //enforceSizeThreshold: 30000,
        cacheGroups: {
          cesium: {
            name: 'cesium',
            test: /[\\/]node_modules[\\/]cesium/,
            chunks: 'all',
            priority: 2,
            minChunks: 2, //module => module.context && module.context.indexOf('cesium') !== -1
            enforce: true
          },
        /* vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            chunks: 'all',
            minChunks: 2,
            name: 'chunk-vendors'
          },*/ //https://twitter.com/iamakulov/status/1275812676212600833
          // https://blog.logrocket.com/guide-performance-optimization-webpack/
          commons: {
            chunks: 'initial',
            minChunks: 2,
            priority: 1
          }
        }
      }
    },
    stats: { colors: true }
    // you can add preact-cli plugins here
    //plugins: [
        //https://github.com/preactjs/preact-cli/wiki/Config-Recipes
        //config.plugins.push( new CopyWebpackPlugin([{ context: `${__dirname}/assets`, from: `*.*` }]) );
        // https://resium.darwineducation.com/installation1https://resium.darwineducation.com/installation1
    //  ],
  };
}

//module exports = {
const baseConfig = (config, env, helpers) => {
  if (!config.plugins) {
        config.plugins = [];
  }

// transform https://github.com/webpack-contrib/copy-webpack-plugin/issues/6
  config.plugins.push(
/*  new UnusedFilesPlugin({
      failOnUnused: true,
      patterns: [/\.js$]
    }),
*/
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
      /*transform: function(content, path) {
            let pat = /\.json$/gi;
            if(pat.test(path)){
              return jsonminify(content.toString());
            }
            return content;
         }*/
      },
      {
        from: path.join(cesiumSource, "Widgets"), //__dirname,
        to: "Widgets", //path.join(__dirname, "Widgets"),
      },
      { from: path.join(cesiumSource, 'ThirdParty'),
        to: 'ThirdParty',
      //transform: content => terser.minify(content.toString()).code
      /*transform: function(content, path) {
            let pat = /\.js$/gi;
            if(pat.test(path)){
              return terser.minify(content.toString()).code;
            }
            return content;
        }*/
      }
      ]
    }),
    new ImageminPlugin({
      cacheFolder: path.resolve(__dirname, 'cache'),
      test: /\.(jpe?g|png|gif|svg)$/i,
      jpegtran: { progressive: true, arithmetic: true },
      optipng: { optimizationLevel: 5 },
      gifsicle: { interlaced: true, optimizationLevel: 3 },
      svgo: {plugins: [{removeViewBox: false}] },
    })
  );

  config.plugins.push(
    new webpack.DefinePlugin({
       // Define relative base path in cesium for loading assets
       CESIUM_BASE_URL: JSON.stringify('')
    })
  );

  if (testenv.NODE_ENV === "production") {

    const htmlplug = helpers.getPluginsByName(config, 'HtmlWebpackPlugin')[0];
    if (htmlplug) {
      //console.log("Have htmlPlugin inject: ", htmlplug.plugin.options.inject);
      console.log("Have htmlPlugin preload: ", htmlplug.plugin.options.preload);
      console.log("Have htmlPlugin production: ", htmlplug.plugin.options.production);
      //console.log("Have htmlPlugin template: ", htmlplug.plugin.options.template);
      //console.log("Have htmlPlugin minify: ", htmlplug.plugin.options.minify);
      htmlplug.plugin.options.production = true;
      htmlplug.plugin.options.preload = true;
      //htmlplug.plugin.options.template = 'template.html';
      //htmlplug.plugin.options.filename = 'index.html';
      /*htmlplug.plugin.options.minify = {
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
          };*/
      console.log("After, have htmlPlugin production: ", htmlplug.plugin.options.production);
    }

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
           filename: 'index.html',
           cache: true,
           preload: true,
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

    const critters = helpers.getPluginsByName(config, 'Critters')[0];
    if (critters) {
        console.log("Have Critters option: ", critters.plugin.options.preload);
        // The default strategy in Preact CLI is "media",
        // but there are 6 different loading techniques:
        // https://github.com/GoogleChromeLabs/critters#preloadstrategy
        critters.plugin.options.preload = 'js'; //'swap';
    }

    //https://github.com/prateekbh/preact-cli-workbox-plugin/blob/master/replace-default-plugin.js
    //const precache_plug = helpers.getPluginsByName(config, 'SWPrecacheWebpackPlugin')[0];
    const precache_plug = helpers.getPluginsByName(config, 'InjectManifest')[0]; //'WorkboxPlugin'
    if (precache_plug) {
        console.log("Have options: ", precache_plug.plugin.config);
        console.log("Have maximumFileSizeToCacheInBytes: ", precache_plug.plugin.config.maximumFileSizeToCacheInBytes);
        precache_plug.plugin.config.maximumFileSizeToCacheInBytes= 5*1024*1024;
        console.log("After maximumFileSizeToCacheInBytes: ", precache_plug.plugin.config);
    }
    //const optCssAsset = helpers.getPluginsByName(config, 'CssMinimizerPlugin')[0]; //'OptimizeCssAssetsWebpack'
    //if (optCssAsset) {
    //  console.log("Have OptimizeCSS Plugin option: ", optCssAsset.plugin.options.processorOptions); //cssProcessorOptions
    //optCssAsset.plugin.options.cssProcessorOptions = {
    /*config.plugins.push(
      //new OptimizeCssAssetsPlugin({
        //cssProcessorOptions: {
	// Fix keyframes in different CSS chunks minifying to colliding names:
	  reduceIdents: false,
          safe: true,
          discardComments: {
            removeAll: true
          }
          //map: { //https://www.programmersought.com/article/32411244994/
          //          // Does not generate inline mapping, so the configuration will generate a source-map file
          //          inline: false,
          //          // Add source-map path comments to the css file
          //          // If there is no such compressed css will remove the source-map path comment
          //          annotation: true
          //}
      }
      //})
    //);*/
    //};
//  config.plugins.push(
//      new PurgecssPlugin({
//        paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
//      })
//    );
/*  config.plugins.push(
      new ExtractCssChunks({
        filename: 'assets/css/[name].[hash].css',
        chunkFilename: 'assets/css/[name].[id].[hash].css',
      })
    );
    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: 'assets/css/[name].[hash].css',
        chunkFilename: "assets/css/[name].[id].[hash].css", //'css/[id].[contenthash].css',
      })
    );
    console.log("HTML crtical webpack plugin...");
    config.plugins.push(
      new HtmlCriticalWebpackPlugin({
        base: path.resolve(__dirname, 'src'),
        src: 'template.html',
        dest: '../build/index.html',
        inline: true,
        minify: true,
        extract: true,
        penthouse: {
          blockJSRequests: false,
        }
      })
    );
    config.plugins.push(
      new Critters({
        preload: 'swap',
        preloadFonts: true
      })
    );
*/
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
/* config.plugins.push(
      new webpack.DllReferencePlugin({
        context : cesiumSource, //paths.cesiumSourceFolder,
        manifest: require(path.join(__dirname, "..", "distdll/cesiumDll-manifest.json")),
      })
    );
*/
/*  config.plugins.push(new PreloadWebpackPlugin({
      //rel: 'preload',
      include: 'allChunks', // or 'initial'
      //chunks: ['asyncChunks'] //, 'myAsyncPreloadChunk'] //'Cesium', 'chunk-vendors',
    }));
*/
    config.plugins.push(new webpack.optimize.MinChunkSizePlugin({
        minChunkSize: 5000, // Minimum number of characters
    }));
    config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin() );
    config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    config.plugins.push(new webpack.NoEmitOnErrorsPlugin());
    // Try to dedupe duplicated modules, if any:
    config.plugins.push( new DuplicatePackageCheckerPlugin() );
// cause a multple instances of self.__WB_MANIFEST error if specified in sw.js. If not specified, then none found error. Weird.
// https://github.com/GoogleChrome/workbox/blob/f2ef9126f36cbf1219e9c27997ac0c4d873a0ca8/packages/workbox-build/src/inject-manifest.js#L152-L153
/* config.plugins.push( new WorkboxPlugin.InjectManifest({
        //swSrc: path.join(process.cwd(), 'src', 'sw.js'), //path.resolve(__dirname, '..', 'src/sw.js'),
        swSrc: '../src/sw.js',
        swDest: 'sw.js',
        //include: undefined, //https://github.com/GoogleChrome/workbox/issues/2681
        exclude: [
          /\.map$/,
          /manifest$/,
          /\.htaccess$/,
          /service-worker\.js$/,
          /sw\.js$/,
        ],
        maximumFileSizeToCacheInBytes: 5*1024*1024,
      })
    ); */
  /*config.plugins.push( new ExtractTextPlugin(
      "assets/css/[name].[chunkhash:8].css", {
          allChunks: true
      })
    );*/
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
//worker_preact_config(config, env, helpers);
//https://github.com/wub/preact-cli-plugin-typescript/issues/3
/*  config.resolve.alias = {
        react: "preact/compat",
        "react-dom": "preact/compat",
        "preact-cli-entrypoint": path.resolve(__dirname, 'src', 'index.js'),
        //"ssr-bundle": path.resolve(__dirname, 'src', 'index.js'),
        ...config.resolve.alias,
  };*/
  return config;
};

/*
const sw_preact_config = (config) => {
  const precacheConfig = {
    staticFileGlobs: [
      'build/** /*.{html,js,css,jpg,jpeg,json,png,svg}',
      'build/assets/icons/favicon*.png'
    ],
    stripPrefix: 'build/',
    navigateFallback: '/index.html',
    runtimeCaching: [{
      urlPattern: /\/(session|search)\//,
      handler: 'networkOnly'
    }, {
      urlPattern: '.*',
      handler: 'cacheFirst'
    }],
    filename: 'sw.js',
    minify: true,
    clientsClaim: true,
    skipWaiting: true,
    maximumFileSizeToCacheInBytes: 10*1024*1024
  };
  return preactCliSwPrecachePlugin(config, precacheConfig);
}*/
// Workbox configuration options: [maximumFileSizeToCacheInBytes]. This will not have any effect, as it will only modify files that are matched via 'globPatterns'
//const worker_preact_config = (config, env, helpers) => {
//console.log(join(__dirname, '..', 'src/sw.js'));

//  return injectManifest(config, helpers, {
//    swSrc: join(__dirname, '..', 'src/sw.js'),
//    swDest: 'sw.js',
//    //include: '**/*.{js,css,html,png,jpg,jpeg,woff2,ttf,eot,svg}',
//    maximumFileSizeToCacheInBytes: 5*1024*1024,
//  });
//}


//module exports = {
export default (config, env, helpers) => {
  return merge(
  //sw_preact_config(config),
    baseConfig(config, env, helpers),
  //worker_preact_config(config, env, helpers),
    cesium_other_config(config, env)
  );
};
