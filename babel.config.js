module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset'
    ],
    // three собран с static-блоками в классах — transpileDependencies гонит его через babel
    plugins: [
        '@babel/plugin-transform-class-static-block'
    ]
};
