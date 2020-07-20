import webpack from 'webpack';
import path from 'path';
//https://cesium.com/docs/tutorials/cesium-and-webpack/
import CopyWebpackPlugin from 'copy-webpack-plugin';
//import merge from 'webpack-merge';
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const cesiumSource = "node_modules/cesium/Source";
const cesiumWorkers = "../Build/Cesium/Workers";

//https://github.com/preactjs/preact-cli/blob/81c7bb23e9c00ba96da1c4b9caec0350570b8929/src/lib/webpack/webpack-client-config.js
const cesium_other_config = () => { //(env)
  return {
    //mode: prod ? "production" : "development",
    //externals: {
      //cesium: "Cesium",
    //},
    entry: {
      app: './src/index.js'
    },
    output: {
      filename: '[name].[hash:8].js',
      sourceMapFilename: '[name].[hash:8].map',
      chunkFilename: '[id].[hash:8].js',
      path: path.resolve(__dirname, 'build'),
      // Needed to compile multiline strings in Cesium
      sourcePrefix: ''
    },
    amd: {
      // Enable webpack-friendly use of require in Cesium
      toUrlUndefined: true
    },
    node: {
      // Resolve node module use of fs
      fs: 'empty'
    },
    resolve: {
      alias: {
        cesium: path.resolve(__dirname, cesiumSource)
      }
    },
    //devServer: {
    //  contentBase: path.join(__dirname, 'dist'),
    //  compress: true,
    //  https: true,
    //  port: 3000,
    //  hot: true
    //},
//https://github.com/CesiumGS/cesium-webpack-example/issues/7
    optimization: {
       minimizer:
       [
         new TerserPlugin({
             sourceMap: false,
             extractComments: {
               filename: (fileData) => {
                 return `${fileData.filename}.OTHER.LICENSE.txt${fileData.query}`;
               }
             }
         })
      ],
      splitChunks: {
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
        //config.plugins.push( new CopyWebpackPlugin([{ context: `${__dirname}/src/assets`, from: `*.*` }]) );
        // https://resium.darwineducation.com/installation1https://resium.darwineducation.com/installation1
    //  ],
  };
}

//module exports = {
const baseConfig = (config) => {
  if (!config.plugins) {
        config.plugins = [];
  }

  config.plugins.push(
     new HtmlWebpackPlugin({
         template: 'template.html'
     })
  );
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
      {
        from: path.join(cesiumSource, cesiumWorkers),
        to: "Workers",
      },
      {
        from: path.join(cesiumSource, "Assets"),
        to: "Assets",
      },
      {
        from: path.join(cesiumSource, "Widgets"),
        to: "Widgets",
      },
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
export default (config) => {
  return merge(
		baseConfig(config),
    cesium_other_config()); 
};
//module exports = config;
