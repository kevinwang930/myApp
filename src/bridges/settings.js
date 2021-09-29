import {ipcRenderer} from 'electron'
import {existsSync, mkdirSync} from 'fs'

export function getOutputPath() {
    const outputPath = ipcRenderer.sendSync('get-output-path')
    if (outputPath) {
        if (!existsSync(outputPath)) {
            mkdirSync(outputPath, {
                recursive: true,
            })
        }
        return outputPath
    }
    throw new Error('输出路径未定义')
}
export function getSqliteFilePath() {
    return ipcRenderer.sendSync('get-sqlite-file-path')
}

export function getSqliteSchemaPath() {
    return ipcRenderer.sendSync('get-sqlite-schema-path')
}

export function getAppSqliteSchemaPath() {
    return ipcRenderer.sendSync('get-app-sqlite-schema-path')
}

export function getGrpcProtoPath() {
    return ipcRenderer.sendSync('get-grpc-proto-path')
}

export function getTemplateExcelOrderPath() {
    const templatePath = ipcRenderer.sendSync('get-template-excelOrder-path')
    if (templatePath && existsSync(templatePath)) {
        return templatePath
    }
    const appTemplatePath = getAppTemplateExcelOrderPath()
    if (appTemplatePath && existsSync(appTemplatePath)) {
        return appTemplatePath
    }
    throw new Error('订单excel模板不存在')
}

export function getAppTemplateExcelOrderPath() {
    return ipcRenderer.sendSync('get-app-template-excelOrder-path')
}

export function resetSettingDefaults() {
    ipcRenderer.invoke('store-reset')
}

export function openSettingFile() {
    ipcRenderer.invoke('open-store-in-editor')
}
