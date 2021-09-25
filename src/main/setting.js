const {app, ipcMain} = require('electron')
const Store = require('electron-store')
const path = require('path')

const configDir = app.getPath('userData')
const store = new Store({
    name: 'myConfig',
    accessPropertiesByDotNotation: false,
    defaults: {
        'sqlite.path': path.resolve(configDir, 'sqlite'),
        'sqlite.storagePath': path.resolve(configDir, 'sqlite/storage'),
        'sqlite.filePath': path.resolve(
            configDir,
            'sqlite/storage/order.sqlite'
        ),
        'sqlite.schemaPath': path.resolve(configDir, 'sqlite/schema.sql'),
        'sqlite.backupPath': path.resolve(configDir, 'sqlite/backup'),
    },
})

ipcMain.on('get-sqlite-file-path', (event) => {
    event.returnValue = store.get('sqlite.filePath', null)
})

ipcMain.on('get-sqlite-schema-path', (event) => {
    event.returnValue = store.get('sqlite.schemaPath', null)
})

ipcMain.on('get-sqlite-app-schema-path', (event) => {
    event.returnValue = store.get('sqlite.appSchemaPath', null)
})

ipcMain.on('get-sqlite-backup-path', (event) => {
    event.returnValue = store.get('sqlite.backupPath', null)
})

module.exports = {
    store,
}
