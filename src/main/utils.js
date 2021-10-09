/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
const {URL} = require('url')
const path = require('path')
const {spawn} = require('child_process')
const {app, ipcMain, dialog, BrowserWindow, shell} = require('electron')
const {constants, existsSync} = require('fs')
const {access, open, writeFile} = require('fs/promises')
const {mainLog, pythonLog} = require('./log')
const {srcPath} = require('../../buildConfig/configs/webpack.paths')
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
    if (!sqliteFilePath || !existsSync(sqliteFilePath)) {
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

async function checkFileWritable(filePath) {
    try {
        await access(filePath, constants.W_OK)
    } catch (e) {
        if (e.code === 'ENOENT') {
            return true
        }
        return Promise.reject(e)
    }

    const fileHandler = await open(filePath, 'r+')
    await fileHandler.close()
    return true
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

ipcMain.handle('printPdf', async (event, fileName) => {
    const mainWindow = BrowserWindow.getFocusedWindow()
    const outputPath = store.get('outputPath')
    const filePath = path.resolve(outputPath, fileName)
    try {
        await checkFileWritable(filePath)
    } catch (e) {
        return {
            result: false,
            message: e.message,
        }
    }
    if (!mainWindow) {
        return {
            result: false,
            message: 'can not get focused window',
        }
    }

    try {
        const data = await mainWindow.webContents.printToPDF({
            landscape: false,
            // printBackground:true,
            // fitToPageEnabled:true,
            // scaleFactor:56,
            pageSize: 'A4',
            marginsType: 0,
        })
        await writeFile(filePath, data)
        shell.openPath(filePath)
        return {result: true, message: null, path: filePath}
    } catch (e) {
        return {result: false, message: e.message}
    }
})

ipcMain.handle('chooseSavePath', async (event, defaultPath) => {
    const saveResult = await dialog.showSaveDialog({
        defaultPath,
        properties: ['showOverwriteConfirmation', 'createDirectory'],
    })
    return saveResult
})

ipcMain.handle('choose-open-path', async (event, defaultPath) => {
    const openResult = await dialog.showOpenDialog({
        defaultPath,
        properties: ['openFile'],
    })
    return openResult
})

module.exports = {
    resolveHtmlPath,
    startPythonService,
    restartPythonService,
}
