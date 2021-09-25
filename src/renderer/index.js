import 'dotenv/config'
import React from 'react'
import ReactDOM from 'react-dom'

import {notification} from 'antd'

import {Provider} from 'react-redux'

import App from './app'

import {store, clearStoreAndFetchData} from './app/store'

import {log} from './log'
import {dbConnect, dbClose} from './api/db'

log.info(`node_env in ${process.env.NODE_ENV} mode `)

async function main() {
    try {
        await dbConnect()
        await clearStoreAndFetchData()
    } catch (e) {
        log.error('导入数据库失败', e.message)
        return
    }

    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.getElementById('root')
    )
}

main()
