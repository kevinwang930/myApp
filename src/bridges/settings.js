import {ipcRenderer} from 'electron'

export function getSqliteFilePath() {
    return ipcRenderer.sendSync('get-sqlite-file-path')
}

export function getSqliteSchemaPath() {
    return ipcRenderer.sendSync('get-sqlite-schema-path')
}

export function getSqliteAppSchemaPath() {
    return ipcRenderer.sendSync('get-sqlite-app-schema-path')
}

export function getGrpcProtoPath() {
    return ipcRenderer.sendSync('get-grpc-proto-path')
}
