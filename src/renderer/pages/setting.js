import React, {useState, useEffect} from 'react'
import {Button, message} from 'antd'
import {
    resetSettingDefaults,
    openSettingFile,
    getOutputPath as config_getOutputPath,
    setOutputPath as config_setOutputPath,
} from '../../bridges/settings'
import {restartPythonService} from '../../bridges/utils'
import {PathSetting} from '../components/pathSetting'
import {SettingBox} from '../components/settingBox'
import {log} from '../log'
import {
    reloadConfig as python_reloadConfig,
    setOutputPath as python_setOutputPath,
} from '../api/grpcClient'

// import {getOutputPath} from ''

export function Setting() {
    const [initOutputPath, setInitOutputPath] = useState('')

    useEffect(() => {
        setInitOutputPath(config_getOutputPath())
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
            key: 'pathSetting',
        })
    }

    const onReset = () => {
        resetSettingDefaults()
        setInitOutputPath(config_getOutputPath())
        python_setOutputPath(initOutputPath)
    }
    return (
        <div>
            <SettingBox description="设置">
                <Button onClick={onReset}>恢复默认</Button>
                <Button onClick={openSettingFile}>打开配置文件</Button>
            </SettingBox>
            <PathSetting
                description="输出路径"
                initPathString={initOutputPath}
                onPathSave={onOutputPathSave}
            />
            <SettingBox description="python服务">
                <Button onClick={restartPythonService}>重启python服务</Button>
            </SettingBox>
        </div>
    )
}
