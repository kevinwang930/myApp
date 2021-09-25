// import 'dotenv/config'
import electronLog from 'electron-log'

export let rendererLog
export let sqliteLog
if (process.env.JEST) {
    rendererLog = console
    sqliteLog = console
} else {
    rendererLog = electronLog.create('rendererLog')
    rendererLog.transports.file.level = false
    rendererLog.transports.console.level = false
    // process.env.LOG_LEVEL.toLowerCase()
    // log.transports.console.format = '[{h}:{i}:{s}] [renderer] [{level}] {text}'
    if (rendererLog.transports.ipc) {
        rendererLog.transports.ipc.level = process.env.LOG_LEVEL.toLowerCase()
    }

    sqliteLog = electronLog.create('sqliteLog')
    sqliteLog.transports.file.level = false
    sqliteLog.transports.console.level = false
    // process.env.LOG_LEVEL.toLowerCase()
    // log.transports.console.format = '[{h}:{i}:{s}] [renderer] [{level}] {text}'
    if (sqliteLog.transports.ipc) {
        sqliteLog.transports.ipc.level = process.env.LOG_LEVEL.toLowerCase()
    }
}
