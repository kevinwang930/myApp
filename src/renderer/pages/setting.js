import React, {useState, useEffect} from 'react'
import {Button, message, notification} from 'antd'
import {
    resetSettingDefaults,
    clearSetting,
    openSettingFile,
    getOutputPath as config_getOutputPath,
    setOutputPath as config_setOutputPath,
    getSqlitePath as config_getSqlitePath,
    getSqliteDumpPath as config_getSqliteDumpPath,
} from '../../bridges/settings'
import {restartPythonService, chooseOpenPath} from '../../bridges/utils'
import {PathSetting} from '../components/pathSetting'
import {SettingBox} from '../components/settingBox'

import {
    reloadConfig as python_reloadConfig,
    setOutputPath as python_setOutputPath,
    setSqlitePath as python_setSqlitePath,
    sqliteDisconnect as python_sqliteDisconnect,
} from '../api/grpcClient'
import {
    sqlite_reset,
    sqlite_connect,
    sqlite_dump,
    sqlite_readDump,
    sqlite_changePath,
    sqlite_backup,
} from '../api/db'
import {clearStoreAndFetchData} from '../app/store'

// import {getOutputPath} from ''

export function Setting() {
    const [initOutputPath, setInitOutputPath] = useState('')
    const [initSqlitePath, setInitSqlitePath] = useState('')

    useEffect(() => {
        setInitOutputPath(config_getOutputPath())
        setInitSqlitePath(config_getSqlitePath())
    }, [])

    const onOutputPathSave = (pathString) => {
        if (pathString === initOutputPath) {
            return
        }
        config_setOutputPath(pathString)
        setInitOutputPath(pathString)
        python_setOutputPath(pathString)
        message.success({
            content: '输出路径设置成功',
            key: 'outputPathSetting',
        })
    }

    const onSqlitePathSave = (pathString) => {
        if (pathString === initSqlitePath) {
            return
        }
        python_sqliteDisconnect()
        sqlite_changePath(pathString)
        setInitSqlitePath(pathString)
        python_setSqlitePath(pathString)
        clearStoreAndFetchData()
        message.success({
            content: 'sqlite路径设置成功',
            key: 'sqlitePathSetting',
        })
    }

    const onReset = () => {
        resetSettingDefaults()
        setInitOutputPath(config_getOutputPath())
        python_setOutputPath(initOutputPath)
    }

    const onClear = () => {
        clearSetting()
        setInitOutputPath(config_getOutputPath())
        python_reloadConfig()
    }

    const onSqliteReset = async () => {
        python_sqliteDisconnect()
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

    const onSqliteDump = async () => {
        sqlite_dump()
    }

    const onSqliteReadDump = async () => {
        const dumpPath = config_getSqliteDumpPath()
        const chooseFileResult = await chooseOpenPath(dumpPath)
        if (chooseFileResult.canceled) {
            return
        }
        const dumpFilePath = chooseFileResult.filePaths[0]
        sqlite_readDump(dumpFilePath)
        await clearStoreAndFetchData()
    }

    const onSqliteBackup = () => {
        const {path} = sqlite_backup()
        notification.success({
            message: '数据库备份完成',
            description: path,
            key: 'databaseBackup',
        })
    }

    return (
        <div>
            <SettingBox description="设置">
                <Button onClick={onReset}>恢复默认</Button>
                <br />
                <Button onClick={onClear}>清除所有设置</Button>
                <br />
                <Button onClick={openSettingFile}>打开配置文件</Button>
                <PathSetting
                    description="输出路径"
                    initPathString={initOutputPath}
                    onPathSave={onOutputPathSave}
                />
            </SettingBox>

            <SettingBox description="sqlite">
                <Button onClick={onSqliteReset}>重置</Button>
                <br />
                <Button onClick={onSqliteBackup}>备份</Button>
                <br />
                <Button onClick={onSqliteDump}>Dump</Button>
                <Button onClick={onSqliteReadDump}>读取Dump</Button>
                <PathSetting
                    description="存储路径"
                    initPathString={initSqlitePath}
                    onPathSave={onSqlitePathSave}
                />
            </SettingBox>
            <SettingBox description="python服务">
                <Button onClick={restartPythonService}>重启python服务</Button>
            </SettingBox>
        </div>
    )
}
