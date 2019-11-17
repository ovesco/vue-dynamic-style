const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const createVariants = require('parallel-webpack').createVariants;

const variants = {
  target: ['commonjs2', 'var', 'umd', 'amd']
};

module.exports = createVariants({}, variants, (options) => {
  return {
    mode: 'production',
    entry: './index.js',
    optimization: {
      minimize: true,
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            output: {
              comments: false,
            },
          },
        }),
      ]
    },
    module: {
      rules: [
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
              },
            },
          ],
        },
      ],
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'vueDynamicStyle.' + options.target + '.min.js',
      libraryTarget: options.target,
    },
  };
});
