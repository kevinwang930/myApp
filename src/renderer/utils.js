import {access, open} from 'fs/promises'
import {constants, existsSync} from 'fs'
import {
    sqlite_getOrCreatePath,
    sqlite_createLoadSchema,
    sqlite_connect,
} from './api/db'
import {startPythonService} from '../bridges/utils'

import {log} from './log'

export async function checkFileWritable(path) {
    try {
        await access(path, constants.W_OK)
    } catch (e) {
        if (e.code === 'ENOENT') {
            return true
        }
        return Promise.reject(e)
    }

    const fileHandler = await open(path, 'r+')
    await fileHandler.close()
    return true
}

export function sqlite_initConnect() {
    const {sqliteFilePath, schemaPath} = sqlite_getOrCreatePath()
    log.info(`sqlite File path ${sqliteFilePath}, schema path ${schemaPath}`)

    if (!existsSync(sqliteFilePath)) {
        sqlite_createLoadSchema(sqliteFilePath, schemaPath)
        startPythonService()
    }

    sqlite_connect()
}
