/**
 * Base webpack config used across other specific configs
 */

const webpackPaths = require('./webpack.paths')
const {dependencies} = require('../../package.json')

let dllPackages = Object.keys(dependencies || {}).filter((name) => {
    if (name.includes('better-sqlite3')) {
        return false
    } else if (name.includes('ant')) {
        return false
    }
    return true
})
console.log(dllPackages)
let dllExternals = {}
dllPackages.forEach((name) => {
    dllExternals[name] = name
})

module.exports = {
    dllPackages,
    dllExternals,
    stats: {
        cachedAssets: true,
        // builtAt:false,
        // moduleAssets:false,
        // nestedModules:false,
        // cachedModules:false,
        // runtimeModules:false,
        // children:false,
        // reasons: true,
        // outputPath: true,
        // source: true,
        modules: false,
        publicPath: true,
    },
}
