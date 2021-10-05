const {app, ipcMain} = require('electron')
const Store = require('electron-store')
const path = require('path')
const fs = require('fs')

function ensurePathExists(pathString) {
    if (!fs.existsSync(pathString)) {
        fs.mkdirSync(pathString, {recursive: true})
    }
}
const appName = app.getName()
const configDir = app.getPath('userData')
const config_filePath = path.resolve(configDir, 'myconfig.json')
const config_outputPath = path.resolve(configDir, 'output')
const config_templatePath = path.resolve(configDir, 'template')
const config_sqlitePath = path.resolve(configDir, 'sqlite')

ensurePathExists(config_outputPath)
ensurePathExists(config_templatePath)
ensurePathExists(config_sqlitePath)

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
const app_sqlitePath = path.resolve(appPath, 'sqlite')

const defaults = {
    outputPath: config_outputPath,
    templatePath: config_templatePath,
    sqlitePath: config_sqlitePath,
    'sqlite.relative.filePath': `${appName}.sqlite`,
    'sqlite.relative.dumpPath': 'dump',
    'sqlite.relative.schemaPath': 'schema.sql',
    'sqlite.relative.backupPath': 'backup',
    'template.relative.excelOrderPath': 'order.xlsx',
    'app.path': appPath,
    'app.assetsPath': app_assetsPath,
    'app.templatePath': app_templatePath,
    'app.publicPath': app_publicPath,
    'app.grpc.protoPath': app_grpc_protoPath,
    'app.sqlitePath': app_sqlitePath,
    'app.python.execPath': app_python_execPath,
    'app.python.srcPath': app_python_srcPath,
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

ipcMain.handle('store-clear', () => {
    store.clear()
})

ipcMain.handle('open-store-in-editor', () => {
    store.openInEditor()
})

ipcMain.handle('set-output-path', (event, pathString) => {
    ensurePathExists(pathString)
    store.set('outputPath', pathString)
})

ipcMain.handle('set-sqlite-path', (event, pathString) => {
    ensurePathExists(pathString)
    const dumpRelativePath = store.get('sqlite.relative.dumpPath', null)
    const backupRelativePath = store.get('sqlite.relative.backupPath', null)
    ensurePathExists(path.resolve(pathString, dumpRelativePath))
    ensurePathExists(path.resolve(pathString, backupRelativePath))
    store.set('sqlitePath', pathString)
})

ipcMain.handle('set-template-path', (event, pathString) => {
    ensurePathExists(pathString)
    store.set('templatePath', pathString)
})

function getSqliteFilePath() {
    const sqlitePath = store.get('sqlitePath', null)
    const filePath = store.get('sqlite.relative.filePath', null)
    if (sqlitePath && filePath) {
        return path.resolve(sqlitePath, filePath)
    }
    return null
}

ipcMain.on('get-sqlite-path', (event) => {
    event.returnValue = store.get('sqlitePath', null)
})

ipcMain.on('get-sqlite-file-path', (event) => {
    event.returnValue = getSqliteFilePath()
})

ipcMain.on('get-sqlite-schema-path', (event) => {
    const sqlitePath = store.get('sqlitePath', null)
    const relativeSchemaPath = store.get('sqlite.relative.schemaPath', null)

    const schemaPath = path.resolve(sqlitePath, relativeSchemaPath)
    if (fs.existsSync(schemaPath)) {
        event.returnValue = schemaPath
    } else {
        const appSqlitePath = store.get('app.sqlitePath', null)
        const appSchemaPath = path.resolve(appSqlitePath, relativeSchemaPath)
        if (fs.existsSync(appSchemaPath)) {
            event.returnValue = appSchemaPath
        } else {
            event.returnValue = null
        }
    }
})

ipcMain.on('get-app-sqlite-schema-path', (event) => {
    const sqlitePath = store.get('app.sqlitePath', null)
    const relativeSchemaPath = store.get('sqlite.relative.schemaPath', null)
    if (sqlitePath && relativeSchemaPath) {
        event.returnValue = path.resolve(sqlitePath, relativeSchemaPath)
    } else {
        event.returnValue = null
    }
})

ipcMain.on('get-sqlite-dump-path', (event) => {
    const sqlitePath = store.get('sqlitePath', null)
    const relativeDumpPath = store.get('sqlite.relative.dumpPath', null)
    if (sqlitePath && relativeDumpPath) {
        const dumpPath = path.resolve(sqlitePath, relativeDumpPath)
        ensurePathExists(dumpPath)
        event.returnValue = dumpPath
    } else {
        event.returnValue = null
    }
})

ipcMain.on('get-sqlite-backup-path', (event) => {
    const sqlitePath = store.get('sqlitePath', null)
    const relativeBackupPath = store.get('sqlite.relative.backupPath', null)
    if (sqlitePath && relativeBackupPath) {
        event.returnValue = path.resolve(sqlitePath, relativeBackupPath)
    } else {
        event.returnValue = null
    }
})

ipcMain.on('get-output-path', (event) => {
    event.returnValue = store.get('outputPath', null)
})

ipcMain.on('get-grpc-proto-path', (event) => {
    event.returnValue = store.get('app.grpc.protoPath')
})

ipcMain.on('get-template-excelOrder-path', (event) => {
    const templatePath = store.get('templatePath', null)
    const relativeExcelOrderTemplatePath = store.get(
        'template.relative.excelOrderPath',
        null
    )
    let excelOrderTemplatePath = path.resolve(
        templatePath,
        relativeExcelOrderTemplatePath
    )
    if (excelOrderTemplatePath && fs.existsSync(excelOrderTemplatePath)) {
        event.returnValue = excelOrderTemplatePath
    } else {
        const appTemplatePath = store.get('app.templatePath', null)
        excelOrderTemplatePath = path.resolve(
            appTemplatePath,
            relativeExcelOrderTemplatePath
        )
        if (excelOrderTemplatePath && fs.existsSync(excelOrderTemplatePath)) {
            event.returnValue = excelOrderTemplatePath
        } else {
            event.returnValue = null
        }
    }
})

// ipcMain.on('get-app-template-excelOrder-path', (event) => {
//     const templatePath = store.get('app.templatePath', null)
//     if (templatePath) {
//         event.returnValue = path.resolve(templatePath, 'order.xlsx')
//     } else {
//         event.returnValue = null
//     }
// })

module.exports = {
    store,
    config_filePath,
    getSqliteFilePath,
}
