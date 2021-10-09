import {ipcRenderer} from 'electron'

export function startPythonService() {
    ipcRenderer.invoke('start-pythonService')
}

export function restartPythonService() {
    ipcRenderer.invoke('restart-pythonService')
}

export function stopPythonService() {
    ipcRenderer.invoke('stop-python-service')
}

export async function chooseOpenPath(defaultPath) {
    return await ipcRenderer.invoke('choose-open-path', defaultPath)
}

export async function printPdf(fileName) {
    return await ipcRenderer.invoke('printPdf', fileName)
}

export function openPath(filePath) {
    ipcRenderer.invoke('open-path', filePath)
}
