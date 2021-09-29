import React from 'react'
import {Button} from 'antd'
import {resetSettingDefaults, openSettingFile} from '../../bridges/settings'
import {restartPythonService} from '../../bridges/utils'

export function Setting() {
    return (
        <div>
            <Button onClick={resetSettingDefaults}>恢复默认</Button>
            <Button onClick={openSettingFile}>打开设置文件</Button>
            <Button onClick={restartPythonService}>重启python服务</Button>
        </div>
    )
}
