import {ipcRenderer} from 'electron'

export function startPythonService() {
    ipcRenderer.invoke('start-pythonService')
}
