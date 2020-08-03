import webpack from 'webpack';
import path from 'path';
//https://cesium.com/docs/tutorials/cesium-and-webpack/
import CopyWebpackPlugin from 'copy-webpack-plugin';
//import merge from 'webpack-merge';
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const cesiumSource = "../node_modules/cesium/Source";
const cesiumWorkers = "../Build/Cesium/Workers";
//const paths = require("./paths");
const testenv = {NODE_ENV: process.env.NODE_ENV};

//https://github.com/preactjs/preact-cli/blob/81c7bb23e9c00ba96da1c4b9caec0350570b8929/src/lib/webpack/webpack-client-config.js
const cesium_other_config = (config, env) => {
  var entryx;
  var outputx = {
      filename: '[name].[hash:8].js',
      sourceMapFilename: '[name].[hash:8].map',
      chunkFilename: 'chunks/[name].[id].[hash:8].js',
      // Needed to compile multiline strings in Cesium
      sourcePrefix: ''
    };

  if (testenv.NODE_ENV === "production") {
    console.log("Node env in production...");
    config.devtool = false;
    entryx = [
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
    output: outputx,
    //https://blog.isquaredsoftware.com/2017/03/declarative-earth-part-1-cesium-webpack/#including-cesium-in-production
    unknownContextCritical : false,
    amd: {
      // Enable webpack-friendly use of require in Cesium
      toUrlUndefined: true
    },
    node: {
      // Resolve node module use of fs
      fs: 'empty'
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
        }, {
            test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
            use: [ 'url-loader' ]
        }, {
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
    resolve: {
      alias: {
        cesium: path.resolve(__dirname, cesiumSource),
        //"react": "preact-compat",
        //"react-dom": "preact-compat"
      }
    },
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      https: true,
      port: 3000,
      proxy: {
	'**': 'http://0.0.0.0:3000'
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
      host : '0.0.0.0',
      disableHostCheck: true,
      quiet: true,
      inline: true,
      compress: true
    },
//https://github.com/CesiumGS/cesium-webpack-example/issues/7
    optimization: {
       usedExports: true,
       minimizer:
       [
         new TerserPlugin({
             cache: true,
             parallel: true,
             sourceMap: true,
             terserOptions: {
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
        //chunks: 'all',
        //name: 'vendors',
        cacheGroups: {
          vendors: {
            name: `chunk-vendors`,
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            chunks: 'initial'
          },
          commons: {
            name: 'Cesium',
            test: /[\\/]node_modules[\\/]cesium/,
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
         production : true
      })
    );
  }

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
      },
      {
        from: path.join(cesiumSource, "Widgets"), //__dirname,
        to: "Widgets", //path.join(__dirname, "Widgets"),
      } /*,
      { from: 'node_modules/cesium/Build/Cesium/ThirdParty',
        to: 'ThirdParty'
      } */
      ],
    })
  );

  config.plugins.push(
    new webpack.DefinePlugin({
          // Define relative base path in cesium for loading assets
       CESIUM_BASE_URL: JSON.stringify('')
    })
  );
  return config;
};

//module exports = {
export default (config, env) => {
  return merge(
    baseConfig(config, env),
    cesium_other_config(config, env)
  );
};
//module exports = config;
