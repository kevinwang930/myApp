import React, {useState, useRef, useEffect} from 'react'
import {Input, Button, message} from 'antd'
import {preparePathInputResult, validatePath} from '../utils'

export function PathSetting({description, initPathString, onPathSave}) {
    const inputRef = useRef()
    const [path, setPath] = useState()

    useEffect(() => {
        if (initPathString !== path) {
            setPath(initPathString)
            inputRef.current.state.value = initPathString
        }
    }, [initPathString])

    const onChange = (e) => {
        setPath(e.target.value)
    }

    const onSave = () => {
        const currentPath = preparePathInputResult(path)

        if (currentPath) {
            if (validatePath(currentPath)) {
                onPathSave(currentPath)
            } else {
                message.error({
                    content: '无效路径',
                    key: 'pathSetting',
                })
            }
        } else {
            message.error({
                content: '无效路径',
                key: 'pathSetting',
            })
        }
    }

    return (
        <div style={{display: 'flex'}}>
            <Input
                addonBefore={<div style={{width: '94px'}}>{description}</div>}
                // addonAfter={<Button onClick={onSave}>保存</Button>}
                onChange={onChange}
                ref={inputRef}
            />
            <Button onClick={onSave}>保存</Button>
        </div>
    )
}
