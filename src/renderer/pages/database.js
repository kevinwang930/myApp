import {ipcRenderer} from 'electron'
import React from 'react'
import path from 'path'
import {Button, notification} from 'antd'
import {
    sqlite_reset,
    sqlite_dump,
    sqlite_readDump,
    sqlite_connect,
} from '../api/db'

import {clearStoreAndFetchData} from '../app/store'

export function Database() {
    const reset = async () => {
        try {
            sqlite_reset()
        } catch (e) {
            notification.error({
                message: '数据库reset失败',
                description: e.message,
                duration: 0,
                key: 'databaseDump',
            })
            sqlite_connect()
        }
        await clearStoreAndFetchData()
    }

    const dump = async () => {
        const chooseFileResult = await ipcRenderer.invoke(
            'chooseSavePath',
            path.resolve(process.env.DATABASE_DUMPPATH)
        )
        if (chooseFileResult.canceled) {
            return
        }
        const {filePath} = chooseFileResult
        const callback = (err, stdout, stderr) => {
            if (err) {
                notification.error({
                    message: '数据库dump失败',
                    description: err,
                    duration: 0,
                    key: 'databaseDump',
                })
            } else if (stderr) {
                notification.error({
                    message: '数据库dump失败',
                    description: stderr,
                    duration: 0,
                    key: 'databaseDump',
                })
            } else {
                notification.success({
                    message: '数据库dump成功',
                    description: filePath,
                    duration: 0,
                    key: 'databaseDump',
                })
            }
        }
        sqlite_dump(filePath, callback)
    }

    const readDump = async () => {
        const chooseFileResult = await ipcRenderer.invoke(
            'chooseOpenPath',
            path.resolve(process.env.DATABASE_DUMPPATH)
        )
        if (chooseFileResult.canceled) {
            return
        }
        const filePath = chooseFileResult.filePaths[0]
        if (!filePath) {
            notification.error({
                message: '读取数据库dump失败',
                description: 'dump文件路径为空',
                duration: 0,
                key: 'databaseDump',
            })
        }
        try {
            sqlite_readDump(filePath)
            await clearStoreAndFetchData()
        } catch (e) {
            notification.error({
                message: '读取数据库dump失败',
                description: e.message,
                duration: 0,
                key: 'databaseDump',
            })
        }
    }

    return (
        <div>
            <div className="flexChildren">
                <Button onClick={reset}>重置</Button>
            </div>

            <div className="flexChildren">
                <Button onClick={dump}>导出dump</Button>
                <Button onClick={readDump}>导入dump</Button>
            </div>
        </div>
    )
}
