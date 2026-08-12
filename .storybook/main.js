const styleRule = (test, extraLoader, { modules = false, exclude } = {}) => ({
  test,
  ...(exclude ? { exclude } : {}),
  use: [
    "style-loader",
    { loader: "css-loader", options: { modules, sourceMap: false } },
    ...(extraLoader ? [{ loader: extraLoader, options: { sourceMap: false } }] : [])
  ]
});

module.exports = {
  framework: "@storybook/react-webpack5",
  // the webpack5 builder ships no JS compiler; without this addon nothing transpiles JSX
  addons: ["@storybook/addon-docs", "@storybook/addon-webpack5-compiler-babel"],
  stories: ["../stories/**/*.stories.@(js|jsx)"],
  webpackFinal: (config) => {
    // the builder ships plain css only; src imports less/scss in both module and global form
    config.module.rules.push(
      styleRule(/\.module\.less$/, "less-loader", { modules: true }),
      styleRule(/\.module\.scss$/, "sass-loader", { modules: true }),
      styleRule(/\.less$/, "less-loader", { exclude: /\.module\.less$/ }),
      styleRule(/\.scss$/, "sass-loader", { exclude: /\.module\.scss$/ })
    );
    return config;
  }
};
