const path = require("path");

function resolveSrc(_path) {
  return path.join(__dirname, _path);
}
// vue.config.js
module.exports = {
  lintOnSave: true,
  configureWebpack: {
    // Set up all the aliases we use in our app.
    resolve: {
      alias: {
        assets: resolveSrc("src/assets"),
      },
    },
  },
  css: {
    // Enable CSS source maps.
    sourceMap: process.env.NODE_ENV !== "production",
  },
  pwa: {
    name: "IVF App",
    themeColor: "#172138",
    msTileColor: "#172138",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black",
  },
  devServer: {
    open: process.platform === "darwin",
    host: "0.0.0.0",
    port: 8082, // CHANGE YOUR PORT HERE!
    https: false,
    hotOnly: false,
  },
};
