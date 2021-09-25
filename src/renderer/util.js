import {access, open} from 'fs/promises'
import {constants, existsSync} from 'fs'
import Store from 'electron-store'
import {log} from './log'

const store = new Store()

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

export function initSqliteConnect() {
    const sqliteFilePath = store.get('sqlite.filePath', null)
    if (!sqliteFilePath) {
        log.error('无法确定sqlite数据库地址')
        return new Error('无法确定sqlite数据库地址')
    }
    if (!existsSync(sqliteFilePath)) {
        initSqlite()
    }
}
