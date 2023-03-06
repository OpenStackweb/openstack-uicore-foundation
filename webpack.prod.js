const TerserJSPlugin            = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin   = require('optimize-css-assets-webpack-plugin');
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
                    }
                }
            }),
            new OptimizeCSSAssetsPlugin({})
        ],
    }
});
