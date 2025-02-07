const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: {
        // security
        'security/actions': './src/components/security/actions.js',
        'security/methods': './src/components/security/methods.js',
        'security/reducers': './src/components/security/reducers.js',
        'security/constants': './src/components/security/constants.js',
        'security/session-checker': './src/components/security/session-checker/op-session-checker.js',
        'security/abstract-auth-callback-route': './src/components/security/abstract-auth-callback-route.js',
        'security/abstract-auth-callback-route-v2': './src/components/security/abstract-auth-callback-route-v2.js',
        // components
        'components/index': './src/components',
        'components/ajaxloader': './src/components/ajaxloader/index.js',
        'components/circle-button': './src/components/circle-button/index.js',
        'components/form-validation': './src/components/form-validation/index.js',
        'components/forms/rsvp-form': './src/components/forms/rsvp-form.js',
        'components/forms/simple-form': './src/components/forms/simple-form.js',
        'components/free-text-search': './src/components/free-text-search/index.js',
        'components/google-map': './src/components/google-map/index.js',
        'components/raw-html': './src/components/raw-html/index.js',
        'components/sections/panel': './src/components/sections/panel.js',
        'components/simple-link-list': './src/components/simple-link-list/index.js',
        'components/summit-dropdown': './src/components/summit-dropdown/index.js',
        'components/table': './src/components/table/Table.js',
        'components/table-editable': './src/components/table-editable/EditableTable.js',
        'components/table-selectable': './src/components/table-selectable/SelectableTable.js',
        'components/table-sortable': './src/components/table-sortable/SortableTable.js',
        'components/attendance-tracker': './src/components/attendance-tracker.js',
        'components/clock': './src/components/clock.js',
        'components/exclusive-wrapper': './src/components/exclusive-wrapper.js',
        'components/video-stream': './src/components/video-stream.js',
        'components/inputs/action-dropdown': './src/components/inputs/action-dropdown/index.js',
        'components/inputs/datetimepicker': './src/components/inputs/datetimepicker/index.js',
        'components/inputs/grouped-dropdown': './src/components/inputs/grouped-dropdown/index.js',
        'components/inputs/upload-input': './src/components/inputs/upload-input/index.js',
        'components/inputs/upload-input-v2': './src/components/inputs/upload-input-v2/index.js',
        'components/inputs/access-levels-input': './src/components/inputs/access-levels-input.js',
        'components/inputs/checkbox-list': './src/components/inputs/checkbox-list.js',
        'components/inputs/company-input': './src/components/inputs/company-input.js',
        'components/inputs/promocode-input': './src/components/inputs/promocode-input.js',
        'components/inputs/country-dropdown': './src/components/inputs/country-dropdown.js',
        'components/inputs/country-input': './src/components/inputs/country-input.js',
        'components/inputs/dropdown': './src/components/inputs/dropdown.js',
        'components/inputs/editor-input': './src/components/inputs/editor-input/index.js',
        'components/inputs/event-input': './src/components/inputs/event-input.js',
        'components/inputs/free-multi-text-input': './src/components/inputs/free-multi-text-input.js',
        'components/inputs/group-input': './src/components/inputs/group-input.js',
        'components/inputs/language-input': './src/components/inputs/language-input.js',
        'components/inputs/member-input': './src/components/inputs/member-input.js',
        'components/inputs/attendee-input': './src/components/inputs/attendee-input.js',
        'components/inputs/operator-input': './src/components/inputs/operator-input.js',
        'components/inputs/organization-input': './src/components/inputs/organization-input.js',
        'components/inputs/radio-list': './src/components/inputs/radio-list.js',
        'components/inputs/speaker-input': './src/components/inputs/speaker-input.js',
        'components/inputs/sponsor-input': './src/components/inputs/sponsor-input.js',
        'components/inputs/summit-input': './src/components/inputs/summit-input.js',
        'components/inputs/tag-input': './src/components/inputs/tag-input.js',
        'components/inputs/text-input': './src/components/inputs/text-input.js',
        'components/inputs/textarea-input': './src/components/inputs/textarea-input.js',
        'components/inputs/registration-company-input':'./src/components/inputs/registration-company-input.js',
        'components/inputs/ticket-types-input':'./src/components/inputs/ticket-types-input.js',
        'components/extra-questions': './src/components/extra-questions/index.js',
        'components/sponsored-project-input' : './src/components/inputs/sponsored-project-input.js',
        'components/schedule-builder-view' : './src/components/schedule-builder-view/index.js',
        'components/schedule-builder-constants' : './src/components/schedule-builder-view/constants.js',
        'components/inputs/summit-days-select' : './src/components/inputs/summit-days-select.js',
        'components/inputs/summit-venues-select' : './src/components/inputs/summit-venues-select.js',
        'components/inputs/stepped-select' : './src/components/inputs/stepped-select/index.jsx',
        'components/bulk-actions-selector' : './src/components/bulk-actions-selector/index.js',
        'components/progressive-img': './src/components/progressive-img/index.js',
        // models
        'models/index': './src/models',
        'models/summit-event' : './src/models/summit-event.js',
        //utils
        'utils/fragment-parser': './src/components/fragment-parser.js',
        'utils/use-fit-text': './src/components/use-fit-text.js',
        'utils/actions': './src/utils/actions.js',
        'utils/methods': './src/utils/methods.js',
        'utils/query-actions': './src/utils/query-actions.js',
        'utils/reducers': './src/utils/reducers.js',
        'i18n': './src/i18n/i18n.js',
        'utils/questions-set': './src/utils/questions-set.js'
    },
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: '[name].js',
        library: 'openstack-uicore-foundation',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: 'this',
        clean: true
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
        }),
    ],
    resolve: {
        fallback: {
            "fs" : false,
            "crypto" : false,
            "react-google-maps" : false,
            "react-final-form" : false,
        }
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
                                {"targets": {"node": "current"}}
                            ],
                            '@babel/preset-react',
                            '@babel/preset-flow'
                        ],
                        plugins: [
                            '@babel/plugin-proposal-object-rest-spread',
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-proposal-optional-chaining',
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
                test: /\.(jpg|png|svg)$/,
                type: 'asset/inline'
            },
            {
                test: /\.yaml$/,
                use: 'js-yaml-loader',
            }
        ]
    },
    externals: [nodeExternals()]
};
