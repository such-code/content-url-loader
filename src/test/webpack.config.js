const path = require('path');

/** @typedef { import(webpack/declarations/WebpackOptions).WebpackOptions } WebpackOptions */
/** @typedef { import('../lib/index').ContentUrlLoaderOptions } ContentUrlLoaderOptions */

/**
 * @type ContentUrlLoaderOptions
 */
const loaderOptions = {
    maxSize: 300,
    name: '[path][contenthash].[ext]',
    contentWrapper: $ => '{ "template": ' + $ + '}',
    urlWrapper: $ => '{ "templateUrl": ' + $ + '}',
}

/**
 * @type WebpackOptions
 */
module.exports = {
    target: "node",
    context: __dirname,
    entry: {
        index: './index.js',
    },
    output: {
        path: path.resolve(process.cwd(), 'dist/test'),
    },
    resolveLoader: {
        alias: {
            '@such-code/content-url-loader': require.resolve('../../'),
        },
    },
    module: {
        rules: [
            {
                test: /\.svg$/i,
                use: {
                    loader: '@such-code/content-url-loader',
                    options: loaderOptions,
                },
            },
        ],
    }
}
