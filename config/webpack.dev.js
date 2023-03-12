const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const deps = require("../package.json").dependencies;

const devConfig = {
    mode: "development",

    devServer: {
        port: 8080,
        historyApiFallback: true,
    },

    devtool: "cheap-module-source-map",

    plugins: [
        new ModuleFederationPlugin({
            name: "utility_bill_splitter",
            filename: "remoteEntry.js",
            exposes: {
                './App': './src/App'
            },
            shared: {
                ...deps,
                react: {
                singleton: true,
                requiredVersion: deps.react,
                },
                "react-dom": {
                singleton: true,
                requiredVersion: deps["react-dom"],
                },
            },
        })
    ]
}

module.exports = merge(common, devConfig);