import {Form, Input, Button, message, Select, Space} from 'antd'

import {useDispatch, useSelector} from 'react-redux'

import React, {useEffect, useState} from 'react'
import {strict as assert} from 'assert'
import {
    MinusCircleOutlined,
    PlusOutlined,
    PlusCircleOutlined,
} from '@ant-design/icons'

import {unwrapResult} from '@reduxjs/toolkit'
import {createProducts} from '../selectors/productsSlice'
import {selectSupplierOptions} from '../selectors/suppliersSlice'
import {trimWhitespace, formProductNoValidator} from '../auxiliary'
import {ProductsUpdateView} from '../components/productsUpdateView'
import {rendererLog} from '../log'

const FormItem = Form.Item
const {TextArea} = Input

export function ProductUpdate(props) {
    const dispatch = useDispatch()
    const supplierOptions = useSelector(selectSupplierOptions)
    // const [supplier, setSupplier] = useState({ id: null, name: null })
    // const [productNos,setProductNos] = useState([])
    const [formRef] = Form.useForm()
    // const onSupplierSelect = (value, option) => {
    //     setSupplier({ id: value, name: option.label })
    // }

    // const onSupplierClear = () => {
    //     setSupplier({ id: null, name: null })
    // }

    const onFinish = async (values) => {
        rendererLog.debug(`creating product ${JSON.stringify(values)}`)
        if (!values.products) {
            return message.error({
                content: '请添加产品条目',
                key: 'empty-product',
            })
        }
        const processedProductsArray = values.products.map((product) => {
            const processedProduct = {}
            for (const [key, value] of Object.entries(product)) {
                if (typeof value === 'string' || value instanceof String) {
                    processedProduct[key] = value.trim()
                } else {
                    processedProduct[key] = value
                }
            }
            return processedProduct
        })

        try {
            const result = await dispatch(
                createProducts(processedProductsArray)
            )
            unwrapResult(result)
            // log.info('result action', actionResult)
            message.success(`${processedProductsArray.length} 产品创建成功`)
            formRef.resetFields()
        } catch (e) {
            message.error(`产品创建失败 ${JSON.stringify(e)}`)
        }
    }

    const layout = {
        labelCol: {
            span: 2,
        },
        wrapperCol: {
            span: 12,
        },
    }
    const inlineLayout = {
        labelCol: {
            span: 2,
        },
        wrapperCol: {
            span: 12,
        },
    }
    const tailLayout = {
        wrapperCol: {
            offset: 5,
            span: 10,
        },
    }

    return <ProductsUpdateView formRef={formRef} onFinish={onFinish} />
}
