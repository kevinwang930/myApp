/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *

 */
// require('core-js/stable');
// require('regenerator-runtime/runtime');
const path = require('path')
const {app, BrowserWindow, shell, ipcMain, dialog} = require('electron')
const {autoUpdater} = require('electron-updater')
const log = require('electron-log')
const fs = require('fs')
require('./setting')
const {mainLog} = require('./log')
const MenuBuilder = require('./menu')
const {resolveHtmlPath, startPythonService, RESOURCES_PATH} = require('./util')

startPythonService()

class AppUpdater {
    constructor() {
        log.transports.file.level = 'info'
        autoUpdater.logger = mainLog
        autoUpdater.checkForUpdatesAndNotify()
    }
}

let mainWindow = null

// if (process.env.NODE_ENV === 'production') {
// 	const sourceMapSupport = require('source-map-support')
// 	sourceMapSupport.install()
// }

const isDevelopment =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'

if (isDevelopment) {
    const debug = require('electron-debug')
    debug()
}

const installExtensions = async () => {
    const {
        default: install,
        // REDUX_DEVTOOLS,
        REACT_DEVELOPER_TOOLS,
    } = require('electron-devtools-installer')
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS
    // const extensions = ['REACT_DEVELOPER_TOOLS']

    return install([REACT_DEVELOPER_TOOLS], forceDownload).catch(console.log)
}

const createWindow = async () => {
    if (
        process.env.NODE_ENV === 'development' ||
        process.env.DEBUG_PROD === 'true'
    ) {
        await installExtensions()
    }

    const getAssetPath = (...paths) => {
        return path.join(RESOURCES_PATH, ...paths)
    }

    mainWindow = new BrowserWindow({
        show: false,
        width: 1024,
        height: 728,
        icon: getAssetPath('icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // preload: path.join(__dirname, 'preload.js'),
        },
    })

    mainWindow.loadURL(resolveHtmlPath('index.html'))

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/main/docs/api/browser-window.md#using-ready-to-show-event
    mainWindow.webContents.on('did-finish-load', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined')
        }
        if (process.env.START_MINIMIZED) {
            mainWindow.minimize()
        } else {
            mainWindow.show()
            mainWindow.focus()
        }
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    const menuBuilder = new MenuBuilder(mainWindow)
    menuBuilder.buildMenu()

    // Open urls in the user's browser
    mainWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault()
        shell.openExternal(url)
    })

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater()
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.whenReady().then(createWindow).catch(console.log)

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
})

ipcMain.handle('printPdf', async (event, outputPath) => {
    try {
        const data = await mainWindow.webContents.printToPDF({
            landscape: false,
            // printBackground:true,
            // fitToPageEnabled:true,
            // scaleFactor:56,
            pageSize: 'A4',
            marginsType: 0,
        })
        await fs.promises.writeFile(outputPath, data)
        return {result: true, message: null}
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

ipcMain.handle('chooseOpenPath', async (event, defaultPath) => {
    const openResult = await dialog.showOpenDialog({
        defaultPath,
        properties: ['openFile'],
    })
    return openResult
})
