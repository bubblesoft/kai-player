/**
 * Created by qhyang on 2017/11/30.
 */

"use strict";

const HtmlWebpack = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

const rootDir = path.resolve(__dirname, "..");

module.exports = {
    devServer: {
        contentBase: path.resolve(rootDir, "dist")
    },
    devtool: "source-map",
    entry: {
        app: [ path.resolve(rootDir, "src", "app", "main") ]
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(rootDir, "build")
    },
    module: {
        loaders: [
            {
                test: /\.vue$/,
                loader: "vue-loader"

            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                loaders: [ "style-loader", "css-loader", "sass-loader" ]
            },
            {
                test: /\.pug$/,
                exclude: /node_modules/,
                loader: "pug-loader"
            },
            {
                test: /\.(?:mp3)$/,
                loader: "url-loader?limit=8192"
            },
            {
                test: /\.less$/,
                loader: [ "style-loader", "css-loader", "less-loader" ]
            },
            {
                test: /\.json$/,
                include: [ path.resolve(rootDir, "src") ],
                loader: "json-loader"
            }
        ]
    },
    plugins: [
        new HtmlWebpack({
            filename: "index.html",
            inject: "body",
            template: path.resolve(rootDir, "src", "index.html"),
            chunks: [ "app" ]
        })
    ],
    resolve: {
        extensions: [ ".vue", ".scss", ".less", ".json", ".js", ".css" ]
    }
};
