module.exports = {
  configureWebpack: {
    resolve: {
      fallback: {
        crypto: false
      }
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: [
              {
                  loader: 'babel-loader'
              }
          ]
      },
      ]
    }
  }
}