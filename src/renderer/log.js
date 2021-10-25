// import 'dotenv/config'
import electronLog from 'electron-log'

export let log
export let sqliteLog
let logLevel
if (process.env.NODE_ENV === 'development' || process.env.PROD_DEBUG) {
    logLevel = 'debug'
} else {
    logLevel = 'info'
}
if (process.env.JEST) {
    log = console
    sqliteLog = console
} else {
    log = electronLog.create('log')
    log.transports.file.level = false
    log.transports.console.level = false
    // process.env.LOG_LEVEL.toLowerCase()
    // log.transports.console.format = '[{h}:{i}:{s}] [renderer] [{level}] {text}'
    if (log.transports.ipc) {
        log.transports.ipc.level = logLevel.toLowerCase()
    }

    sqliteLog = electronLog.create('sqliteLog')
    sqliteLog.transports.file.level = false
    sqliteLog.transports.console.level = false
    // process.env.LOG_LEVEL.toLowerCase()
    // log.transports.console.format = '[{h}:{i}:{s}] [renderer] [{level}] {text}'
    if (sqliteLog.transports.ipc) {
        sqliteLog.transports.ipc.level = logLevel.toLowerCase()
    }
}
