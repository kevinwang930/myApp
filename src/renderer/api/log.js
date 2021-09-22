// import 'dotenv/config'
import electronLog  from 'electron-log'
export let log
if (process.env.JEST) {
    log = console
} else {
    log = electronLog.create('log')
    log.transports.file.level = false
    log.transports.console.level = false
    // process.env.LOG_LEVEL.toLowerCase()
    // log.transports.console.format = '[{h}:{i}:{s}] [renderer] [{level}] {text}'
    if (log.transports.ipc) {
        log.transports.ipc.level = process.env.LOG_LEVEL.toLowerCase()
    }
}







