import {ipcRenderer} from 'electron'
import {existsSync} from 'fs'

export function getOutputPath() {
    return ipcRenderer.sendSync('get-output-path')
}
export async function setOutputPath(pathString) {
    ipcRenderer.invoke('set-output-path', pathString)
}
export function getSqliteFilePath() {
    const sqliteFilePath = ipcRenderer.sendSync('get-sqlite-file-path')
    if (sqliteFilePath) {
        return sqliteFilePath
    }
    throw new Error('sqlite 存储文件路径未定义')
}

export function getSqlitePath() {
    return ipcRenderer.sendSync('get-sqlite-path')
}

export function setSqlitePath(pathString) {
    ipcRenderer.invoke('set-sqlite-path', pathString)
}

export function getSqliteSchemaPath() {
    const schemaPath = ipcRenderer.sendSync('get-sqlite-schema-path')
    if (schemaPath && existsSync(schemaPath)) {
        return schemaPath
    }
    throw new Error('sqlite schema 不存在')
}

export function getSqliteDumpPath() {
    return ipcRenderer.sendSync('get-sqlite-dump-path')
}

export function getSqliteBackupPath() {
    return ipcRenderer.sendSync('get-sqlite-backup-path')
}

export function getGrpcProtoPath() {
    return ipcRenderer.sendSync('get-grpc-proto-path')
}

export function getTemplateExcelOrderPath() {
    const template_excelOrderPath = ipcRenderer.sendSync(
        'get-template-excelOrder-path'
    )
    if (template_excelOrderPath && existsSync(template_excelOrderPath)) {
        return template_excelOrderPath
    }
    throw new Error('订单excel模板不存在')
}

export function resetSettingDefaults() {
    ipcRenderer.invoke('store-reset')
}

export function clearSetting() {
    ipcRenderer.invoke('store-clear')
}

export function openSettingFile() {
    ipcRenderer.invoke('open-store-in-editor')
}
