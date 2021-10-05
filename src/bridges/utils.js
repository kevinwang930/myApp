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
