/**
 * Created by qhyang on 2018/5/11.
 */

'use strict';

const path = require('path');

const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const rootDir = path.resolve(__dirname, '..');

module.exports = {
    mode: 'production',
    entry: {
        app: [ path.resolve(rootDir, 'src', 'app', 'main') ]
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(rootDir, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                loaders: [ 'style-loader', 'css-loader', 'sass-loader' ],
                exclude: /node_modules/
            },
            {
                test: /\.pug$/,
                exclude: /node_modules/,
                loader: 'pug-plain-loader'
            },
            {
                test: /\.(?:mp3|svg|png|ico)$/,
                loader: 'url-loader?limit=8192'
            },
            {
                test: /\.less$/,
                loader: [ 'style-loader', 'css-loader', 'less-loader' ]
            },
            {
                test: /\.css$/,
                loader: [ 'style-loader', 'css-loader' ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            inject: 'body',
            template: path.resolve(rootDir, 'src', 'index.html'),
            chunks: [ 'app', 'runtime' ]
        }),
        new VueLoaderPlugin(),
        new UglifyJSPlugin()
    ],
    optimization: {
        runtimeChunk: {
            name: 'runtime'
        }
    },
    resolve: {
        extensions: [ '.vue', '.scss', '.less', '.js', '.css' ]
    }
};
