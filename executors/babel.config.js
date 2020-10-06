module.exports = {
    presets: [
        ["@babel/preset-env", {
            targets: {
                node: "current"
            }
        }],
        ["@babel/preset-typescript"],
    ],

    plugins: [
        "@babel/plugin-proposal-nullish-coalescing-operator",
        "@babel/plugin-proposal-optional-chaining",
        ["@babel/plugin-proposal-class-properties",
            { "loose": true }],
        ["@babel/transform-runtime"]
    ],
};