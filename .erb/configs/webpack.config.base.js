/**
 * Base webpack config used across other specific configs
 */

const webpack = require('webpack') ;
const webpackPaths = require ('./webpack.paths');
const externals = require ('../../release/app/package.json').dependencies;
module.exports =  {
  externals: [...Object.keys(externals || {})],

  stats: {

  cachedAssets: true,
    // builtAt:false,
    // moduleAssets:false,
    // nestedModules:false,
    // cachedModules:false,
    // runtimeModules:false,
    // children:false,
    // reasons: true,
    // outputPath: true,
    // source: true,
    modules: false,
    publicPath: true,      
  },

  // module: {
  //   rules: [
  //     {
  //       test: /\.jsx?$/,
  //       exclude: /node_modules/,
  //       use: {
  //         loader: 'babel-loader',
  //       },
  //     },
  //   ],
  // },

  // output: {
  //   path: webpackPaths.srcPath,
  //   // https://github.com/webpack/webpack/issues/1114
  //   library: {
  //     type: 'commonjs2',
  //   },
  // },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  // resolve: {
  //   extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  //   modules: [webpackPaths.srcPath, 'node_modules'],
  // },

  // plugins: [
  //   new webpack.EnvironmentPlugin({
  //     NODE_ENV: 'production',
  //   }),
  // ],
};
