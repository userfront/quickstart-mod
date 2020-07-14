const { modId } = require("./anymod/anymod.config.js");

module.exports = {
  productionSourceMap: false,
  filenameHashing: false,
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
  },
  devServer: {
    disableHostCheck: true,
  },
  chainWebpack(config) {
    config.plugin("html").tap((args) => {
      args[0].modId = modId;
      return args;
    });
  },
};
