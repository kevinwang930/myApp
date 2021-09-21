/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
const {URL} = require('url')
const path = require('path')
const {spawn} = require('child_process')
const {app} = require('electron')
const {fs} = require('fs')
const {mainLog, pythonLog} = require('./log')
const {srcPath} = require('../../.erb/configs/webpack.paths')

let startPythonService
let resolveHtmlPath

// database related
let DB_DIR_PATH
let SQLITE_PATH

let RESOURCES_PATH

let APP_ROOT_PATH

let PYTHON_EXEC_PATH

let pythonService

let appSetting = {}

function getPaths() {
    if (app.isPackaged) {
        APP_ROOT_PATH = path.dirname(app.getPath('exe'))
        RESOURCES_PATH = path.join(process.resourcesPath, 'assets')
        PYTHON_EXEC_PATH = path.join(
            APP_ROOT_PATH,
            'pythonService/pythonService.exe'
        )
    } else {
        RESOURCES_PATH = path.join(__dirname, '../../assets')
    }
}

function loadSetting() {
    if (APP_ROOT_PATH) {
        const settingPath = path.resolve(APP_ROOT_PATH, 'setting.json')
        if (fs.existsSync(settingPath)) {
            appSetting = require(settingPath)
        }
    }
}

function getDbPaths() {
    if (app.isPackaged) {
        DB_DIR_PATH =
            appSetting.DB_DIR_PATH || path.resolve(APP_ROOT_PATH, 'db')
    } else {
        DB_DIR_PATH = path.resolve(__dirname, '../../db')
    }
    SQLITE_PATH = path.resolve(DB_DIR_PATH, 'storage/order.sqlite')
    process.env.SQLITE_PATH = SQLITE_PATH
    process.env.DB_DIR_PATH = DB_DIR_PATH
}

function startPythonServicePacked() {
    mainLog.info('start python service from ', PYTHON_EXEC_PATH)

    pythonService = spawn(PYTHON_EXEC_PATH)

    pythonService.stdout.on('data', (data) => {
        pythonLog.info(data.toString('utf8'))
    })

    pythonService.stderr.on('data', (data) => {
        pythonLog.info(data.toString('utf8'))
    })
}

function startPythonServiceSrc(dbPath) {
    mainLog.info('start python service')

    const pythonServicePath = path.resolve(
        srcPath,
        'pythonService/async_server.py'
    )
    pythonService = spawn(
        `python`,
        [pythonServicePath]

        // renderer process is a demon process, may not use inherit
        // {
        //     stdio:'inherit'
        // }
    )

    pythonService.stdout.on('data', (data) => {
        pythonLog.info(data.toString('utf8'))
    })

    pythonService.stderr.on('data', (data) => {
        pythonLog.info(data.toString('utf8'))
    })
}

getPaths()
loadSetting()
getDbPaths()

if (app.isPackaged) {
    startPythonService = startPythonServicePacked
} else if (process.env.NODE_ENV === 'development') {
    startPythonService = startPythonServiceSrc
}

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

async function restartPythonService() {
    await pythonService.kill()
    startPythonService()
}

module.exports = {
    resolveHtmlPath,
    RESOURCES_PATH,
    startPythonService,
    restartPythonService,
}
