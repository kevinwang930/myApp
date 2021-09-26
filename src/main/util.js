/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
const {URL} = require('url')
const path = require('path')
const {spawn} = require('child_process')
const {app, ipcMain} = require('electron')
const fs = require('fs')
const {mainLog, pythonLog} = require('./log')
const {srcPath} = require('../../.erb/configs/webpack.paths')
const {store} = require('./setting')

// database related

let pythonService

function startPythonServicePacked(sqliteFilePath) {
    const pythonExecPath = store.get('app.python.execPath')
    mainLog.info('start python service from ', pythonExecPath)

    pythonService = spawn(pythonExecPath, {
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

ipcMain.handle('start-pythonService', () => {
    startPythonService()
})

module.exports = {
    resolveHtmlPath,
    startPythonService,
    restartPythonService,
}
