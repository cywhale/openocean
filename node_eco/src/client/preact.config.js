import webpack from 'webpack';
import path from 'path';
//https://cesium.com/docs/tutorials/cesium-and-webpack/
import CopyWebpackPlugin from 'copy-webpack-plugin';
const cesiumSource = "node_modules/cesium/Source";
const cesiumWorkers = "../Build/Cesium/Workers";

//module exports = {
export default (config) => {
  if (!config.plugins) {
        config.plugins = [];
  }

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
  return config; //{
  /*  
    //mode: prod ? "production" : "development",
    //externals: {
      //cesium: "Cesium",
      //CESIUM_BASE_URL: JSON.stringify('localhost:8020')
    //},
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),

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
          //cesium$: "cesium/Cesium",
          //cesium: "cesium/Source",
          cesium: path.resolve(__dirname, cesiumSource)
        },
    },
    // you can add preact-cli plugins here
    plugins: [
      //https://github.com/preactjs/preact-cli/wiki/Config-Recipes
      //config.plugins.push( new CopyWebpackPlugin([{ context: `${__dirname}/src/assets`, from: `*.*` }]) );
      // https://resium.darwineducation.com/installation1https://resium.darwineducation.com/installation1
      //new HtmlWebpackPlugin({
      //  template: 'src/index.html'
      //}),
    ],
	/**
	 * Function that mutates the original webpack config.
	 * Supports asynchronous changes when a promise is returned (or it's an async function).
	 *
	 * @param {object} config - original webpack config.
	 * @param {object} env - options passed to the CLI.
	 * @param {WebpackConfigHelpers} helpers - object with useful helpers for working with the webpack config.
	 * @param {object} options - this is mainly relevant for plugins (will always be empty in the config), default to an empty object
	 webpack(config, env, helpers, options) {
    }, 	 **/
  //}
};
//module exports = config;
