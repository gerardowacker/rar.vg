const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

require("dotenv").config({ path: "./.env/production.env" });

module.exports = function (_env, argv) {
    const isProduction = argv.mode === "production";

    return {
        target: "web",
        devtool: "source-map",
        entry: "./src/index.js",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "assets/js/[name].[contenthash:8].js",
            publicPath: "/",
            clean: true
        },
        module: {
            rules: [
                {
                    test: /\.(jsx|js)?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            cacheDirectory: true,
                            cacheCompression: false,
                            envName: isProduction ? "production" : "development",
                            presets: [
                                ["@babel/preset-react", { "runtime": "automatic" }]
                            ]
                        },
                    }
                },
                {
                    test: /\.md$/,
                    type: "asset/source"
                },
                {
                    test: /\.css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : "style-loader",
                        "css-loader"
                    ]
                },
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    type: "asset",
                    parser: { dataUrlCondition: { maxSize: 8192 } },
                    generator: { filename: "static/media/[name].[hash:8][ext]" }
                },
                {
                    test: /\.(eot|otf|ttf|woff2?)$/,
                    type: "asset/resource",
                    generator: { filename: "static/media/[name].[hash:8][ext]" }
                },
                {
                    test: /\.svg$/,
                    use: ["@svgr/webpack"]
                }
            ]
        },
        resolve: { extensions: [".js", ".jsx"] },
        plugins: [
            isProduction &&
            new MiniCssExtractPlugin({
                filename: "assets/css/[name].[contenthash:8].css",
                chunkFilename: "assets/css/[name].[contenthash:8].chunk.css"
            }),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, "public/index.html"),
                inject: true
            }),
            new webpack.DefinePlugin({
                "process.env": JSON.stringify(process.env)
            }),
            new webpack.DefinePlugin({
                "process.env.NODE_ENV": JSON.stringify(
                    isProduction ? "production" : "development"
                )
            })
        ].filter(Boolean),
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserWebpackPlugin({
                    terserOptions: {
                        compress: { comparisons: false },
                        mangle: { safari10: true },
                        output: { comments: false, ascii_only: true },
                        warnings: false
                    }
                }),
                new CssMinimizerPlugin()
            ],
            splitChunks: {
                chunks: "all",
                minSize: 0,
                maxInitialRequests: 10,
                maxAsyncRequests: 10,
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name(module, chunks, cacheGroupKey) {
                            const packageName = module.context.match(
                                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                            )[1];
                            return `${cacheGroupKey}.${packageName.replace("@", "")}`;
                        }
                    },
                    common: {
                        minChunks: 2,
                        priority: -10
                    }
                }
            },
            runtimeChunk: "single"
        },
        devServer: {
            static: { directory: path.join(__dirname, "public") },
            compress: true,
            historyApiFallback: true,
            allowedHosts: "all",
            client: { overlay: true },
            open: true
        }
    };
};
