const TerserJSPlugin            = require('terser-webpack-plugin');
const CssMinimizerPlugin        = require("css-minimizer-webpack-plugin");
const { merge}                  = require('webpack-merge');
const common                    = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    optimization: {
        minimize: true,
        minimizer: [
            new TerserJSPlugin({
                parallel: true,
                terserOptions: {
                    compress: {inline: false},
                    sourceMap: {
                        file: '[name].map'
                    },
                    mangle: { reserved: ['Lock','SuperTokensLock','GET_TOKEN_SILENTLY_LOCK_KEY'] }
                }
            }),
            new CssMinimizerPlugin(),
        ],
    }
});
