/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
const {URL} = require('url')
const path = require('path')
const {spawn} = require('child_process')
const {app, ipcMain} = require('electron')
const fs = require('fs')
const {mainLog, pythonLog} = require('./log')
const {srcPath} = require('../../.erb/configs/webpack.paths')
const {store, config_filePath, getSqliteFilePath} = require('./setting')

// database related

let pythonService

function startPythonServicePacked() {
    const pythonExecPath = store.get('app.python.execPath')
    mainLog.info('start python service from ', pythonExecPath)

    pythonService = spawn(pythonExecPath, {
        env: {
            ...process.env,
            CONFIG_FILEPATH: config_filePath,
        },
    })

    pythonService.stdout.on('data', (data) => {
        pythonLog.info(data.toString('utf8'))
    })

    pythonService.stderr.on('data', (data) => {
        pythonLog.info(data.toString('utf8'))
    })
}

function startPythonServiceSrc() {
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
                CONFIG_FILEPATH: config_filePath,
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
    const sqliteFilePath = getSqliteFilePath()
    if (!sqliteFilePath || !fs.existsSync(sqliteFilePath)) {
        mainLog.warn(
            `python service started, sqlite file ${sqliteFilePath} doesn't exist, `
        )
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
    if (pythonService) {
        await pythonService.kill()
        pythonService = null
    }
    startPythonService()
}

ipcMain.handle('start-pythonService', () => {
    startPythonService()
})

ipcMain.handle('restart-pythonService', () => {
    restartPythonService()
})

ipcMain.handle('stop-python-service', async () => {
    if (pythonService) {
        await pythonService.kill()
        pythonService = null
    }
})

module.exports = {
    resolveHtmlPath,
    startPythonService,
    restartPythonService,
}
