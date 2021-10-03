import {access, open} from 'fs/promises'
import {constants, existsSync, mkdirSync} from 'fs'
import path from 'path'
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

export const prepareFormResult = (object) => {
    // set empty string and blank string to null
    // trim string
    // set undefined to null
    const processedObject = {}
    for (const [key, value] of Object.entries(object)) {
        if (value === undefined || value === '') {
            processedObject[key] = null
        } else if (typeof value === 'string' || value instanceof String) {
            const trimedValue = value.trim()
            if (trimedValue === '') {
                processedObject[key] = null
            } else {
                processedObject[key] = trimedValue
            }
        } else {
            processedObject[key] = value
        }
    }
    return processedObject
}

export const prepareInputResult = (inputString) => {
    if (inputString && inputString.length >= 0) {
        const result = inputString.trim()
        if (result.length) {
            return result
        }
        return null
    }
    return null
}

export const preparePathInputResult = (inputString) => {
    const inputResult = prepareInputResult(inputString)
    if (inputResult) {
        return path.resolve(inputResult)
    }
    return null
}

export function findDuplicateInArray(array, value) {
    let occurTimes = 0
    array.forEach((element) => {
        if (element === value) {
            occurTimes += 1
        }
    })
    if (occurTimes >= 2) {
        return true
    }
    return false
}

const pathRegex = /^[a-z]:((\\|\/|\\\\)[a-z0-9\s_@\-^!#$%&+={}\[\]]+)+$/i

export function validatePath(pathString) {
    if (pathRegex.test(pathString)) {
        return true
    }
    return false
}

export function ensurePathExists(pathString) {
    if (!existsSync(pathString)) {
        mkdirSync(pathString, {recursive: true})
    }
}
