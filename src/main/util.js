/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
const {URL} = require('url')
const path = require('path')
const {spawn} = require('child_process')
const {app} = require('electron')
const {mainLog, pythonLog} = require('./log')
const {srcPath} = require('../../.erb/configs/webpack.paths')

let startPythonService
let resolveHtmlPath
let SQLITE_PATH

let RESOURCES_PATH

let APP_ROOT_PATH

let PYTHON_EXEC_PATH

function startPythonServicePacked() {
    mainLog.info('start python service from ', PYTHON_EXEC_PATH)

    const cp = spawn(PYTHON_EXEC_PATH)

    cp.stdout.on('data', (data) => {
        pythonLog.info(data.toString('utf8'))
    })

    cp.stderr.on('data', (data) => {
        pythonLog.info(data.toString('utf8'))
    })
}

function startPythonServiceSrc(dbPath) {
    mainLog.info('start python service')

    const pythonServicePath = path.resolve(
        srcPath,
        'pythonService/async_server.py'
    )
    const cp = spawn(
        `python`,
        [pythonServicePath]

        // renderer process is a demon process, may not use inherit
        // {
        //     stdio:'inherit'
        // }
    )

    cp.stdout.on('data', (data) => {
        pythonLog.info(data.toString('utf8'))
    })

    cp.stderr.on('data', (data) => {
        pythonLog.info(data.toString('utf8'))
    })
}

if (app.isPackaged) {
    RESOURCES_PATH = path.join(process.resourcesPath, 'assets')
    APP_ROOT_PATH = path.dirname(app.getPath('exe'))
    SQLITE_PATH = path.join(APP_ROOT_PATH, 'db/storage/order.sqlite')
    PYTHON_EXEC_PATH = path.join(
        APP_ROOT_PATH,
        'pythonService/pythonService.exe'
    )

    startPythonService = startPythonServicePacked
} else {
    RESOURCES_PATH = path.join(__dirname, '../../assets')
    SQLITE_PATH = path.join(__dirname, '../../db')
    startPythonService = startPythonServiceSrc
}

process.env.SQLITE_PATH = SQLITE_PATH

if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212
    resolveHtmlPath = (htmlFileName) => {
        const url = new URL(`http://localhost:${port}`)
        url.pathname = htmlFileName
        return url.href
    }
} else {
    resolveHtmlPath = (htmlFileName) => {
        return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`
    }
}

module.exports = {
    resolveHtmlPath,
    RESOURCES_PATH,
    startPythonService,
}
