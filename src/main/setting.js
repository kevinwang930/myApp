const {app, ipcMain} = require('electron')
const Store = require('electron-store')
const path = require('path')

const configDir = app.getPath('userData')
const config_filePath = path.resolve(configDir, 'myconfig.json')
const config_outputPath = path.resolve(configDir, 'output')
const config_templatePath = path.resolve(configDir, 'template')
const config_sqlitePath = path.resolve(configDir, 'sqlite')
const config_sqlite_storagePath = path.resolve(config_sqlitePath, 'storage')
const config_sqlite_filePath = path.resolve(
    config_sqlite_storagePath,
    'order.sqlite'
)
const config_template_excelOrderPath = path.resolve(
    config_templatePath,
    'orderReport.xlsx'
)
const config_sqlite_schemaPath = path.resolve(config_sqlitePath, 'schema.sql')
const config_sqlite_backupPath = path.resolve(config_sqlitePath, 'backup')

let appPath
let app_assetsPath
let app_python_execPath
let app_python_srcPath
if (app.isPackaged) {
    appPath = path.dirname(app.getPath('exe'))
    app_assetsPath = path.resolve(process.resourcesPath, 'assets')
    app_python_execPath = path.join(appPath, 'pythonService/pythonService.exe')
} else {
    appPath = process.cwd()
    app_assetsPath = path.resolve(appPath, 'assets')
    app_python_srcPath = path.resolve(
        appPath,
        'src/pythonService/async_server.py'
    )
}
const app_publicPath = path.resolve(appPath, 'public')
const app_templatePath = path.resolve(app_publicPath, 'template')
const app_grpc_protoPath = path.resolve(app_publicPath, 'jsPython.proto')
const app_dbPath = path.resolve(appPath, 'db')
const app_sqlite_schemaPath = path.resolve(app_dbPath, 'sqlite_schema.sql')
const app_template_excelOrderPath = path.resolve(
    app_templatePath,
    'orderReport.xlsx'
)

const defaults = {
    outputPath: config_outputPath,
    templatePath: config_templatePath,
    'sqlite.path': config_sqlitePath,
    'sqlite.storagePath': config_sqlite_storagePath,
    'sqlite.filePath': config_sqlite_filePath,
    'sqlite.schemaPath': config_sqlite_schemaPath,
    'sqlite.backupPath': config_sqlite_backupPath,
    'template.excelOrderPath': config_template_excelOrderPath,
    'app.path': appPath,
    'app.assetsPath': app_assetsPath,
    'app.templatePath': app_templatePath,
    'app.publicPath': app_publicPath,
    'app.grpc.protoPath': app_grpc_protoPath,
    'app.dbPath': app_dbPath,
    'app.sqlite.schemaPath': app_sqlite_schemaPath,
    'app.python.execPath': app_python_execPath,
    'app.python.srcPath': app_python_srcPath,
    'app.template.excelOrderPath': app_template_excelOrderPath,
}

const store = new Store({
    name: 'myConfig',
    accessPropertiesByDotNotation: false,
    defaults,
    clearInvalidConfig: true,
})

ipcMain.handle('store-reset', () => {
    store.reset(...Object.keys(defaults))
})

ipcMain.handle('open-store-in-editor', () => {
    store.openInEditor()
})

ipcMain.on('get-sqlite-file-path', (event) => {
    event.returnValue = store.get('sqlite.filePath', null)
})

ipcMain.on('get-sqlite-schema-path', (event) => {
    event.returnValue = store.get('sqlite.schemaPath', null)
})

ipcMain.on('get-app-sqlite-schema-path', (event) => {
    event.returnValue = store.get('app.sqlite.schemaPath', null)
})

ipcMain.on('get-sqlite-backup-path', (event) => {
    event.returnValue = store.get('sqlite.backupPath', null)
})

ipcMain.on('get-output-path', (event) => {
    event.returnValue = store.get('outputPath', null)
})

ipcMain.on('get-grpc-proto-path', (event) => {
    event.returnValue = store.get('app.grpc.protoPath')
})

ipcMain.on('get-template-excelOrder-path', (event) => {
    event.returnValue = store.get('template.excelOrderPath')
})
ipcMain.on('get-app-template-excelOrder-path', (event) => {
    event.returnValue = store.get('app.template.excelOrderPath')
})
module.exports = {
    store,
    config_filePath,
}
