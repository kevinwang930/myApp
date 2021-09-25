/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
const {URL} = require('url')
const path = require('path')
const {spawn} = require('child_process')
const {app} = require('electron')
const fs = require('fs')
const {mainLog, pythonLog} = require('./log')
const {srcPath} = require('../../.erb/configs/webpack.paths')
const {store} = require('./setting')

// database related

let GRPC_PROTO_PATH
let RESOURCES_PATH
let APP_ROOT_PATH
let APP_PUBLIC_PATH
let PYTHON_EXEC_PATH

let pythonService

function initPathsAndEnv() {
    if (app.isPackaged) {
        APP_ROOT_PATH = path.dirname(app.getPath('exe'))
        APP_PUBLIC_PATH = path.resolve(APP_ROOT_PATH, 'public')
        GRPC_PROTO_PATH = path.resolve(APP_PUBLIC_PATH, 'jsPython.proto')
        RESOURCES_PATH = path.join(process.resourcesPath, 'assets')
        PYTHON_EXEC_PATH = path.join(
            APP_ROOT_PATH,
            'pythonService/pythonService.exe'
        )
    } else if (process.env.NODE_ENV === 'development') {
        RESOURCES_PATH = path.join(__dirname, '../../assets')
        GRPC_PROTO_PATH = path.resolve('public/jsPython.proto')
    }
    process.env.GRPC_PROTO_PATH = GRPC_PROTO_PATH
}

function startPythonServicePacked(sqliteFilePath) {
    mainLog.info('start python service from ', PYTHON_EXEC_PATH)

    pythonService = spawn(PYTHON_EXEC_PATH, {
        env: {
            ...process.env,
            SQLITE_PATH: sqliteFilePath,
        },
    })

    pythonService.stdout.on('data', (data) => {
        pythonLog.info(data.toString('utf8'))
    })

    pythonService.stderr.on('data', (data) => {
        pythonLog.info(data.toString('utf8'))
    })
}

function startPythonServiceSrc(sqliteFilePath) {
    mainLog.info('start python service')

    const pythonServicePath = path.resolve(
        srcPath,
        'pythonService/async_server.py'
    )
    pythonService = spawn(
        `python`,
        [pythonServicePath],
        {
            env: {
                ...process.env,
                SQLITE_PATH: sqliteFilePath,
            },
        }

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

function startPythonService() {
    const sqliteFilePath = store.get('sqlite.filePath', null)
    if (!sqliteFilePath || !fs.existsSync(sqliteFilePath)) {
        mainLog.warn(
            `sqlite file ${sqliteFilePath} doesn't exist, quite python service`
        )
        return
    }

    if (app.isPackaged) {
        startPythonServicePacked(sqliteFilePath)
    } else if (process.env.NODE_ENV === 'development') {
        startPythonServiceSrc(sqliteFilePath)
    }
}

function resolveHtmlPath(htmlFileName) {
    if (process.env.NODE_ENV === 'development') {
        const port = process.env.PORT || 1212

        const url = new URL(`http://localhost:${port}`)
        url.pathname = htmlFileName
        return url.href
    }
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`
}

async function restartPythonService() {
    await pythonService.kill()
    startPythonService()
}

initPathsAndEnv()

module.exports = {
    resolveHtmlPath,
    RESOURCES_PATH,
    startPythonService,
    restartPythonService,
}
