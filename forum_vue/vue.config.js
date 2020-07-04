const webpack = require("webpack");

// const CompressionWebpackPlugin = require("compression-webpack-plugin");
/*const isProduction = process.env.NODE_ENV !== "development";
const devNeedCdn = true;
const cdn = {
  externals: {
    vue: "Vue",
    vuex: "Vuex",
    "vue-router": "VueRouter",
    axios: "axios",
    qs: "Qs"

  },
  css: [],
  js: [
    "https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.min.js",
    "https://cdn.jsdelivr.net/npm/vuex@3.5.1/dist/vuex.min.js",
    "https://cdn.jsdelivr.net/npm/vue-router@3.3.4/dist/vue-router.min.js",
    "https://cdn.jsdelivr.net/npm/axios@0.19.2/dist/axios.min.js",
    "https://cdn.jsdelivr.net/npm/qs@6.9.4/dist/qs.min.js"
  ]
};*/
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
        changeOrigin: true
      }
    }
  },
  chainWebpack: config => {
    config.plugin("provide").use(webpack.ProvidePlugin, [
      {
        "window.Quill": "quill/dist/quill.js",
        Quill: "quill/dist/quill.js"
      }
    ]);
  }
  /*,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules(?!\/quill-image-drop-module|quill-image-resize-module)/,
          loader: "babel-loader"
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        "window.Quill": "quill/dist/quill.js",
        Quill: "quill/dist/quill.js"
      })
    ]
  }*/
  /*  chainWebpack: config => {
    config.plugin("html").tap(args => {
      if (isProduction || devNeedCdn) args[0].cdn = cdn;
      return args;
    });

    /!*    config
      .plugin("webpack-bundle-analyzer")
      .use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin);*!/
  },*/
  /*  configureWebpack: config => {
    // if (isProduction || devNeedCdn) config.externals = cdn.externals;
    const productionGzipExtensions = ["html", "js", "css"];
    config.plugins.push(
      new CompressionWebpackPlugin({
        filename: "[path].gz[query]",
        algorithm: "gzip",
        test: new RegExp("\\.(" + productionGzipExtensions.join("|") + ")$"),
        threshold: 10240, // 只有大小大于该值的资源会被处理 10240
        minRatio: 0.8, // 只有压缩率小于这个值的资源才会被处理
        deleteOriginalAssets: false // 删除原文件
      })
    );
  }*/
};
