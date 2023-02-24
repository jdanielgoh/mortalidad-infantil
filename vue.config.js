const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  productionSourceMap: true,
  publicPath: process.env.VUE_APP_BASE_ROUTE || '/',



  configureWebpack: {
    plugins: [
      new CopyPlugin([
          { from: "src/assets/data/", to: "data/" }
      ]),
    ],
  },
};