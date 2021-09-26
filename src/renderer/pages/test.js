import React, {useState, useRef} from 'react'
import ReactDOM from 'react-dom'

import {Table, Input, Button, Space, message} from 'antd'
// import Highlighter from 'react-highlight-words';
import {SearchOutlined} from '@ant-design/icons'
import {log} from '../log'
import {client} from '../api/grpcClient'

function onClick() {
    client.sayHello({name: 'kevin'}, (err, Response) => {
        if (err) {
            message.error(err)
        } else {
            message.success(Response.message)
        }
    })
}
export function Test() {
    return <Button onClick={onClick}>rpc测试</Button>
}
