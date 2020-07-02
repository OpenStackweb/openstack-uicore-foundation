const MiniCssExtractPlugin      = require("mini-css-extract-plugin");
const path                      = require('path');
const nodeExternals             = require('webpack-node-externals');

module.exports = {
    entry: {
        'components': './src/components.js',
        'methods': './src/methods.js',
        'actions': './src/actions.js',
        'reducers': './src/reducers.js',
    },
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: '[name].js',
        library: 'openstack-uicore-foundation',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: 'this'
    },
    node: {fs: 'empty'},
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
        }),
    ],
    /*optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    chunks: "async",
                    name: "vendor",
                    priority: 10,
                    enforce: true
                }
            }
        }
    },*/
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                { "targets": { "node": "current" } }
                            ],
                            '@babel/preset-react',
                            '@babel/preset-flow'
                        ],
                        plugins: ['@babel/plugin-proposal-object-rest-spread', '@babel/plugin-proposal-class-properties']
                    }
                }
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.less/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"]
            },
            {
                test: /\.module\.scss/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            sourceMap: false
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: false
                        }
                    }
                ]
            },
            {
                test: /\.scss/,
                exclude: /\.module\.scss/,
                use: [MiniCssExtractPlugin.loader, "css-loader", 'sass-loader']
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: "url-loader?limit=10000&minetype=application/font-woff&name=fonts/[name].[ext]"
            },
            {
                test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: "file-loader?name=fonts/[name].[ext]"
            },
            {
                test: /\.jpg|\.png|\.gif$/,
                use: "file-loader?name=images/[name].[ext]"
            },
            {
                test: /\.svg/,
                use: "file-loader?name=svg/[name].[ext]!svgo-loader"
            },
            {
                test: /\.yaml$/,
                use: 'js-yaml-loader',
            }
        ]
    },
    target: 'web',
    externals: [nodeExternals()]
};
