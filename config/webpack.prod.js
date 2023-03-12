import ModuleFederationPlugin from 'webpack/lib/container/ModuleFederationPlugin';
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const deps = require("../package.json").dependencies;

const prodConfig = {
    mode: "production",

    output: {
        publicPath: "http://localhost:8080/",
    },

    plugins: [
        new ModuleFederationPlugin({
            name: "utility_bill_splitter",
            filename: "remoteEntry.js",
            exposes: {
                './App': './src/app'
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

module.exports = merge(common, prodConfig);