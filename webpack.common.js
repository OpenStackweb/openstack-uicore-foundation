const MiniCssExtractPlugin      = require("mini-css-extract-plugin");
const path                      = require('path');
const nodeExternals             = require('webpack-node-externals');

module.exports = {
    entry: {
        // security
        'security/actions':'./src/components/security/actions.js',
        'security/methods':'./src/components/security/methods.js',
        'security/reducers':'./src/components/security/reducers.js',
        'security/session-checker':'./src/components/security/session-checker/op-session-checker.js',
        'security/abstract-auth-callback-route' : './src/components/security/abstract-auth-callback-route.js',
        // components
        'components/ajaxloader':'./src/components/ajaxloader/index.js',
        'components/circle-button':'./src/components/circle-button/index.js',
        'components/form-validation':'./src/components/form-validation/index.js',
        'components/forms/rsvp-form': './src/components/forms/rsvp-form.js',
        'components/forms/simple-form': './src/components/forms/simple-form.js',
        'components/free-text-search': './src/components/free-text-search/index.js',
        'react-google-maps': {import: 'react-google-maps', runtime: 'runtime' },
        'components/google-map': { import: './src/components/google-map/index.js', dependOn:'react-google-maps' },
        'components/raw-html':'./src/components/raw-html/index.js',
        'components/sections/panel':'./src/components/sections/panel.js',
        'components/simple-link-list': './src/components/simple-link-list/index.js',
        'components/summit-dropdown' : './src/components/summit-dropdown/index.js',
        'components/table' : './src/components/table/Table.js',
        'components/table-editable' : './src/components/table-editable/EditableTable.js',
        'components/table-selectable' : './src/components/table-selectable/SelectableTable.js',
        'react-dnd': { import : ['react-dnd', 'react-dnd-html5-backend'], runtime: 'runtime' },
        'components/table-sortable' : { import : './src/components/table-sortable/SortableTable.js', dependOn: 'react-dnd' },
        'components/attendance-tracker' : './src/components/attendance-tracker.js',
        'components/clock' : './src/components/clock.js',
        'components/exclusive-wrapper' : './src/components/exclusive-wrapper.js',
        'components/video-stream' : './src/components/video-stream.js',
        'components/inputs/action-dropdown' : './src/components/inputs/action-dropdown/index.js',
        'components/inputs/datetimepicker' : './src/components/inputs/datetimepicker/index.js',
        'components/inputs/grouped-dropdown' : './src/components/inputs/grouped-dropdown/index.js',
        'react-dropzone': { import : ['react-dropzone'], runtime: 'runtime'},
        'react-select': { import: ['react-select'], runtime: 'runtime'},
        'components/inputs/upload-input' : { import : './src/components/inputs/upload-input/index.js' , dependOn: 'react-dropzone'},
        'components/inputs/upload-input-v2' : './src/components/inputs/upload-input-v2/index.js',
        'components/inputs/access-levels-input' : { import : './src/components/inputs/access-levels-input.js', dependOn: 'react-select'},
        'components/inputs/checkbox-list' : './src/components/inputs/checkbox-list.js',
        'components/inputs/company-input' : { import : './src/components/inputs/company-input.js', dependOn: 'react-select'},
        'components/inputs/country-dropdown' : { import : './src/components/inputs/country-dropdown.js', dependOn: 'react-select'},
        'components/inputs/country-input' : { import : './src/components/inputs/country-input.js', dependOn: 'react-select'},
        'components/inputs/dropdown' : { import: './src/components/inputs/dropdown.js', dependOn: 'react-select'},
        'components/inputs/editor-input' : './src/components/inputs/editor-input.js',
        'components/inputs/event-input' : './src/components/inputs/event-input.js',
        'components/inputs/free-multi-text-input' : { import : './src/components/inputs/free-multi-text-input.js', dependOn: 'react-select'},
        'components/inputs/group-input' : { import : './src/components/inputs/group-input.js' , dependOn: 'react-select'},
        'components/inputs/language-input' : { import : './src/components/inputs/language-input.js', dependOn: 'react-select'},
        'components/inputs/member-input': {import : './src/components/inputs/member-input.js' , dependOn: 'react-select'},
        'components/inputs/organization-input': { import: './src/components/inputs/organization-input.js', dependOn: 'react-select'},
        'components/inputs/radio-list': './src/components/inputs/radio-list.js',
        'components/inputs/speaker-input' : {import : './src/components/inputs/speaker-input.js', dependOn: 'react-select'},
        'components/inputs/sponsor-input': { import : './src/components/inputs/sponsor-input.js', dependOn: 'react-select'},
        'components/inputs/summit-input' : { import : './src/components/inputs/summit-input.js',dependOn: 'react-select'},
        'components/inputs/tag-input': { import : './src/components/inputs/tag-input.js',dependOn: 'react-select'},
        'components/inputs/text-input' : './src/components/inputs/text-input.js',
        'components/inputs/textarea-input' : './src/components/inputs/textarea-input.js',
        'utils/fragment-parser' : './src/components/fragment-parser.js',
        'utils/use-fit-text' : './src/components/use-fit-text.js',
        'utils/actions' : './src/utils/actions.js',
        'utils/methods' : './src/utils/methods.js',
        'utils/query-actions' : './src/utils/query-actions.js',
        'utils/reducers' : './src/utils/reducers.js',
        'i18n':'./src/i18n/i18n.js',
    },
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: '[name].js',
        library: 'openstack-uicore-foundation',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: 'this'
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
        }),
    ],
    resolve: {
        fallback: { "fs": false }
    },
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
                        plugins: [
                            '@babel/plugin-proposal-object-rest-spread', 
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-proposal-optional-chaining'
                        ]
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
                use: {
                    loader: "url-loader",
                    options: {
                        limit: 25000,
                    },
                },
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
    target: 'node',
    externals: [nodeExternals()]
};
