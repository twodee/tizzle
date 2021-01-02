module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
  },
  devServer: {
    open: true,
    contentBase: './public',
    publicPath: '/dist',
    port: 9000,
  },
  devtool: 'eval-cheap-module-source-map',
};
