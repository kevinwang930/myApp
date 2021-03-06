/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {credentials, loadPackageDefinition} from '@grpc/grpc-js'
import {loadSync} from '@grpc/proto-loader'
import {getGrpcProtoPath} from '../../bridges/settings'

import {log} from '../log'

const PROTO_PATH = getGrpcProtoPath()

const packageDefinition = loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
})
const {jsPython} = loadPackageDefinition(packageDefinition)

const target = 'localhost:50051'
export const client = new jsPython.Communication(
    target,
    credentials.createInsecure()
)

export function sayHello() {
    client.sayHello({name: 'kevin'}, (err, response) => {
        if (err) {
            log.error(err)
        } else {
            log.debug('Greeting:', response.message)
        }
    })
}

export function reloadConfig() {
    client.reloadConfig(null, () => {})
}

export function setOutputPath(pathString) {
    client.setOutputPath({path: pathString}, () => {})
}

export function setSqlitePath(pathString) {
    client.setSqlitePath({path: pathString}, () => {})
}
export function setTemplatePath(pathString) {
    client.setTemplatePath({path: pathString}, () => {})
}

export function sqliteDisconnect() {
    client.sqliteDisconnect({}, () => {})
}
