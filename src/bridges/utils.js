import {ipcRenderer} from 'electron'

export function startPythonService() {
    ipcRenderer.invoke('start-pythonService')
}

export function restartPythonService() {
    ipcRenderer.invoke('restart-pythonService')
}
