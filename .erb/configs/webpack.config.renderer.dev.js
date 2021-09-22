const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const chalk = require('chalk')
const {merge} = require('webpack-merge')

const {spawn, execSync} = require('child_process')
const baseConfig = require('./webpack.config.base')
const webpackPaths = require('./webpack.paths')
const checkNodeEnv = require('../scripts/check-node-env')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const BundleAnalyzerPlugin =
    require('webpack-bundle-analyzer').BundleAnalyzerPlugin

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === 'production') {
    checkNodeEnv('development')
}

const port = process.env.PORT || 1212

module.exports = merge(baseConfig, {
    devtool: 'inline-source-map',

    mode: 'development',

    target: 'electron-renderer',
    // externalsPresets: {
    //     electronRenderer: true,
    //     node: true,
    // },
    externals: {
        'better-sqlite3': 'commonjs better-sqlite3',
    },
    entry: [
        'webpack-dev-server/client?http://localhost:1212/dist',
        'webpack/hot/only-dev-server',
        // 'core-js',
        // 'regenerator-runtime/runtime',
        path.join(webpackPaths.srcRendererPath, 'index.js'),
    ],

    output: {
        path: webpackPaths.distRendererPath,
        publicPath: '/',
        filename: 'renderer.dev.js',
        // library: {
        // 	type: 'umd',
        // },
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [webpackPaths.srcRendererPath],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        electron: '13',
                                    },
                                },
                            ],
                            [
                                '@babel/preset-react',
                                {
                                    runtime: 'automatic',
                                },
                            ],
                        ],
                        plugins: [
                            [
                                'import',
                                {
                                    libraryName: 'antd',
                                    style: 'css',
                                },
                            ],
                        ],
                    },
                },
            },
            {
                test: /\.global\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /(?<!global)\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            // SASS support - compile all .global.scss files and pipe it to style.css
            {
                test: /\.global\.(scss|sass)$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: 'sass-loader',
                    },
                ],
            },
            // SASS support - compile all other .scss files and pipe it to style.css
            {
                test: /^((?!\.global).)*\.(scss|sass)$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: '@teamsupercell/typings-for-css-modules-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName:
                                    '[name]__[local]__[hash:base64:5]',
                            },
                            sourceMap: true,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'sass-loader',
                    },
                ],
            },
            // WOFF Font
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'application/font-woff',
                    },
                },
            },
            // WOFF2 Font
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'application/font-woff',
                    },
                },
            },
            // OTF Font
            {
                test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'font/otf',
                    },
                },
            },
            // TTF Font
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'application/octet-stream',
                    },
                },
            },
            // EOT Font
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader',
            },
            // SVG Font
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'image/svg+xml',
                    },
                },
            },
            // Common Image Formats
            {
                test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
                use: 'url-loader',
            },
        ],
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),

        /**
         * Create global constants which can be configured at compile time.
         *
         * Useful for allowing different behaviour between development builds and
         * release builds
         *
         * NODE_ENV should be production so that modules do not perform certain
         * development checks
         *
         * By default, use 'development' as NODE_ENV. This can be overriden with
         * 'staging', for example, by changing the ENV variables in the npm scripts
         */
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'development',
        }),

        // new webpack.LoaderOptionsPlugin({
        //     debug: true,
        // }),

        new ReactRefreshWebpackPlugin(),

        new HtmlWebpackPlugin({
            filename: path.join('index.html'),
            template: path.join(webpackPaths.srcRendererPath, 'index.ejs'),
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true,
            },
            isBrowser: false,
            env: process.env.NODE_ENV,
            isDevelopment: process.env.NODE_ENV !== 'production',
            nodeModules: webpackPaths.appNodeModulesPath,
        }),
    ],

    node: {
        __dirname: false,
        __filename: false,
    },

    devServer: {
        port,
        compress: true,
        hot: true,
        headers: {'Access-Control-Allow-Origin': '*'},
        static: {
            publicPath: '/',
        },
        historyApiFallback: {
            verbose: true,
            disableDotRule: false,
        },
        onBeforeSetupMiddleware() {
            console.log('Starting Main Process...')
            spawn('npm', ['run', 'start:main'], {
                shell: true,
                env: process.env,
                stdio: 'inherit',
            })
                .on('close', (code) => process.exit(code))
                .on('error', (spawnError) => console.error(spawnError))
        },
    },
})
