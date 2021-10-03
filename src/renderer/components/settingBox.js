import React from 'react'
import {Typography} from 'antd'

const {Text} = Typography

export function SettingBox({description, children}) {
    return (
        <div className="settingBox">
            <Text strong>{description}</Text>
            <br />
            {children}
        </div>
    )
}
