module.exports = {
  publicPath: "/",
  transpileDependencies: ["vuetify"],
  devServer: {
    disableHostCheck: true,
    port: 8080,
    host: "localhost",
    https: false,
    open: false,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8118",
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          "^/api": ""
        }
      }
    }
  }
};
