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
const {app, BrowserWindow, shell} = require('electron')
const {autoUpdater} = require('electron-updater')
const {store} = require('./setting')
const {mainLog} = require('./log')
const MenuBuilder = require('./menu')
const {resolveHtmlPath, startPythonService} = require('./utils')

startPythonService()

class AppUpdater {
    constructor() {
        autoUpdater.logger = mainLog
        autoUpdater.checkForUpdatesAndNotify()
    }
}

let mainWindow = null

// if (process.env.NODE_ENV === 'production') {
// 	const sourceMapSupport = require('source-map-support')
// 	sourceMapSupport.install()
// }

// const isDevelopment =
//     process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'
// if (isDevelopment) {
//     const debug = require('electron-debug')
//     debug()
// }
const installExtensions = async () => {
    const {
        default: install,
        REDUX_DEVTOOLS,
        REACT_DEVELOPER_TOOLS,
    } = require('electron-devtools-installer')
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS
    const extensions = [REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]

    return install(extensions, forceDownload).catch(console.log)
}

const createWindow = async () => {
    mainLog.debug('start create window')
    if (
        process.env.NODE_ENV === 'development' ||
        process.env.DEBUG_PROD === 'true'
    ) {
        await installExtensions()
    }

    const getAssetPath = (...paths) => {
        const assetPath = store.get('app.assetsPath')
        return path.join(assetPath, ...paths)
    }

    const iconPath = getAssetPath('icon.png')
    mainLog.debug('icon path', iconPath)
    mainWindow = new BrowserWindow({
        show: true,
        width: 1024,
        height: 728,
        // icon: iconPath,
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
