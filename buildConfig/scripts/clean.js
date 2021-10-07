const {rmSync} = require('fs')
const webpackPaths = require('../configs/webpack.paths')

function cleanBuild() {
    rmSync(webpackPaths.buildPath, {
        recursive: true,
        force: true,
    })
    console.log(`${webpackPaths.buildPath} cleaned`)
}

function cleanDist() {
    rmSync(webpackPaths.distPath, {
        recursive: true,
        force: true,
    })
    console.log(`${webpackPaths.distPath} cleaned`)
}

module.exports = {
    cleanBuild,
    cleanDist,
}
