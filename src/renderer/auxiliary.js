import {message} from 'antd'

import {
    checkSupplierNameDuplicate,
    checkProductNoExistInSupplier,
    checkOrderNoExist,
} from './api/db'
import {log} from './api/log'

export const supplierNameValidator = async (rule, value, callback) => {
    // log.debug(`in validator, value is ${value} value length ${value.length}`)
    if (!value) {
        return Promise.reject('公司名称必须')
    }
    const duplicate = await checkSupplierNameDuplicate(value)
    if (duplicate) {
        return Promise.reject('公司名称已存在!')
    }
    return Promise.resolve()
}

export const isString = (value) =>
    typeof value === 'string' || value instanceof String
export const trimWhitespace = (value) => {
    if (isString(value)) {
        return value.trim()
    }
    return value
}

export const objectTrimString_emptyToNull = (object) => {
    const processedObject = {}
    for (const [key, value] of Object.entries(object)) {
        if (typeof value === 'string' || value instanceof String) {
            const trimedValue = value.trim()
            if (trimedValue === '') {
                processedObject[key] = null
            } else {
                processedObject[key] = trimedValue
            }
        } else {
            processedObject[key] = value
        }
    }
    return processedObject
}

export const prepareFormResult = (object) => {
    // set empty string and blank string to null
    // trim string
    // set undefined to null
    const processedObject = {}
    for (const [key, value] of Object.entries(object)) {
        if (value === undefined || value === '') {
            processedObject[key] = null
        } else if (typeof value === 'string' || value instanceof String) {
            const trimedValue = value.trim()
            if (trimedValue === '') {
                processedObject[key] = null
            } else {
                processedObject[key] = trimedValue
            }
        } else {
            processedObject[key] = value
        }
    }
    return processedObject
}

export const nonEmptyValidator = (rule, value, callback, cellName) => {
    if (!value) {
        return Promise.reject(`${cellName}不能为空`)
    }
    return Promise.resolve()
}

export const emptyValidator = (rule, value, callback) => {
    return Promise.resolve()
}

export const productNoUpdateValidator = async (
    rule,
    value,
    callback,
    record
) => {
    if (!value) {
        return Promise.reject('产品编号不能为空')
    }

    if (value === record.productNo) {
        return Promise.resolve()
    }

    const result = await checkProductNoExistInSupplier(record.supplierId, value)
    if (!result) {
        return Promise.reject('编号产品已存在')
    }
    return Promise.resolve()
}

export const orderNoCreateValidator = async (rule, value, callback) => {
    if (!value) {
        return Promise.reject('订单编号不能为空')
    }
    const exist = await checkOrderNoExist(value)
    if (!exist) {
        return Promise.resolve()
    }
    return Promise.reject('订单编号已存在!')
}

export const priceValidator = async (rule, value, callback) => {
    log.debug(value)
    if (!value) {
        return callback('产品价格不能为空')
    }
    return Promise.resolve()
}

export const permanentErrorMessage = (content, key) => {
    message.error({
        content,
        key,
        duration: 0,
        onClick: () => {
            message.destroy(key)
        },
    })
}
