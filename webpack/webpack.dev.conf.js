/**
 * Created by qhyang on 2017/11/30.
 */

'use strict';

const path = require('path');

const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BannerWebpackPlugin = require('banner-webpack-plugin');

const rootDir = path.resolve(__dirname, '..');

module.exports = {
    mode: 'development',
    devServer: {
        contentBase: path.resolve(rootDir, 'build'),
        proxy: {
            '/audio': 'http://localhost:3000'
        }
    },
    devtool: 'source-map',
    entry: {
        app: [ path.resolve(rootDir, 'src', 'app', 'main') ]
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(rootDir, 'build')
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
                test: /\.js$/,
                loader: 'babel-loader',
                include: [
                    path.resolve(rootDir, 'node_modules', 'three-audio-visualization')
                ]
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
                include: [
                    path.resolve(rootDir, 'node_modules', 'three-audio-visualization', 'src', 'vendors', 'physijs', 'physijs_worker.js'),
                    path.resolve(rootDir, 'node_modules', 'ammo.js')
                ],
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
        new BannerWebpackPlugin({
            chunks: {
                app: {
                    afterContent: `//
                    (function() {  
                        if (window.TweenLite) {
                            var counter = document.querySelector('.loading__counter');
        
                            TweenLite.to({
                                progress: 20
                            }, 0.5, {
                                progress: 100,
                                onUpdate: function() {
                                    counter.querySelector('h1').childNodes[0].data = this.target.progress.toFixed() + "%";
                                    counter.querySelector('hr').style.width = this.target.progress.toFixed() + "%";
                                },
                                onComplete: function() {
                                    TweenLite.to({
                                        opacity: 1
                                    }, 0.5, {
                                        opacity: 0,
                                        onUpdate: function() {
                                            document.querySelector('.loading').style.opacity = '' + this.target.opacity;
                                        },
                                        onComplete: function() {
                                            document.querySelector('.loading').style.display = 'none';
                                        }
                                    });
                                }
                            });
                        }
                    }());
                `},
                runtime: {
                    beforeContent: `//
                    (function() {  
                        if (window.TweenLite) {
                            var counter = document.querySelector('.loading__counter');
        
                            TweenLite.to({
                                progress: 10
                            }, 0.5, {
                                progress: 20,
                                onUpdate: function() {
                                    counter.querySelector('h1').childNodes[0].data = this.target.progress.toFixed() + "%";
                                    counter.querySelector('hr').style.width = this.target.progress.toFixed() + "%";
                                }
                            });
                        }
                    }());
                `}
            }
        })
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
