const {app} = require('electron')
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

module.exports = {
    store,
}
