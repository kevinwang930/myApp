const electronLog = require('electron-log')

let logLevel
if (process.env.NODE_ENV === 'development') {
    logLevel = 'debug'
} else {
    logLevel = 'info'
}
process.env.LOG_LEVEL = logLevel
const pythonLog = electronLog.create('pythonLog')
pythonLog.transports.file.level = false
pythonLog.transports.ipc.level = false
pythonLog.transports.console.level = logLevel.toLowerCase()
pythonLog.transports.console.format = '[{h}:{i}:{s}] {text}'

const log = electronLog.create('log')
log.transports.file.level = false
log.transports.console.level = logLevel.toLowerCase()
log.transports.console.format = '[{h}:{i}:{s}] [renderer] [{level}] {text}'
log.transports.ipc.level = logLevel.toLowerCase()

const mainLog = electronLog.create('mainLog')
mainLog.transports.file.level = false
mainLog.transports.ipc.level = false
mainLog.transports.console.useStyles = true
mainLog.transports.console.level = logLevel.toLowerCase()
mainLog.transports.console.format = '[{h}:{i}:{s}] [main] [{level}] {text}'
module.exports = {
    mainLog,
    pythonLog,
}
