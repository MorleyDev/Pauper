const webpack = require("webpack");
const isProd = process.argv.indexOf("--env.prod") >= 0;
const { resolve } = require("path");


module.exports = {
    mode: isProd ? "production": "development",
    devtool: isProd ? undefined : "source-map",
    entry: {
        "index": "./index.tsx"
    },
    output: {
        filename: "[name].js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                use: ["ts-loader"],
                exclude: [resolve(__dirname, "node_modules")]
            }
        ]
    },
    devServer: {
        hot: true,
        noInfo: true,
        host: "0.0.0.0",
        disableHostCheck: true,
        port: 8080,
        inline: true
    },
    plugins: isProd ? [] : [new webpack.NamedModulesPlugin() ]
}
