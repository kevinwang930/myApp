import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Form, Input, Button, message, Select, Space} from 'antd'
import {createProducts} from '../selectors/productsSlice'
import {selectSupplierOptions} from '../selectors/suppliersSlice'

import {log} from '../log'

import {strict as assert} from 'assert'
import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons'

import {trimWhitespace} from '../auxiliary'
import {checkProductNoExistInSupplier} from '../api/db'
import {prepareFormResult} from '../auxiliary'

const FormItem = Form.Item
const {TextArea} = Input
export function ProductsCreateView(props) {
    const dispatch = useDispatch()
    const supplierOptions = useSelector(selectSupplierOptions)
    const [supplier, setSupplier] = useState({id: null, name: null})
    // const [productNos,setProductNos] = useState([])
    const [form] = Form.useForm()
    const onSupplierSelect = (value, option) => {
        setSupplier({id: value, name: option.label})
    }

    const onSupplierClear = () => {
        setSupplier({id: null, name: null})
    }

    const getPreviousProductNos = (index) => {
        if (index === 0) {
            return []
        }

        const previousProducts = form.getFieldValue('products').slice(0, index)
        if (previousProducts && previousProducts.length) {
            return previousProducts.map((product) => product.productNo)
        } else {
            return []
        }
    }

    const productNoValidator = (rule, value, callback, name) => {
        if (!value) {
            return Promise.reject('产品编号不能为空')
        }

        const index = parseInt(name)
        let previousProductNos = getPreviousProductNos(index)
        if (previousProductNos.includes(value)) {
            return Promise.reject('编号重复')
        }

        let exist = checkProductNoExistInSupplier(supplier.id, value)
        if (exist) {
            return Promise.reject('编号产品已存在')
        } else {
            return Promise.resolve()
        }
    }

    const onFinish = async (updateInfo) => {
        if (!updateInfo.products) {
            return message.error({
                content: '请添加产品条目',
                key: 'empty-product',
            })
        }
        const productsInfo = updateInfo.products.map((product) => {
            let processedProduct = prepareFormResult(product)

            processedProduct.supplierId = updateInfo.supplierId
            return processedProduct
        })

        try {
            await dispatch(createProducts(productsInfo)).unwrap()

            message.success(`${productsInfo.length} 产品创建成功`)
            form.resetFields()
            log.debug(`supplier id after create ${supplier.id}`)
            setSupplier({id: null, name: null})
        } catch (e) {
            message.error(`产品创建失败 ${e.message}`)
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

    return (
        <Form
            form={form}
            layout="horizontal"
            // {...layout}
            // initialValues={productEditing}
            onFinish={onFinish}
            validateTrigger="onBlur"
        >
            <FormItem
                label="选择供应商"
                name="supplierId"
                // hasFeedback
                {...layout}
                rules={[{required: true, message: '请先选定供应商!'}]}
            >
                <Select
                    showSearch
                    defaultActiveFirstOption="false"
                    allowClear
                    options={supplierOptions}
                    optionFilterProp="label"
                    onSelect={onSupplierSelect}
                    onClear={onSupplierClear}
                />
            </FormItem>
            <Form.List name="products">
                {(fields, {add, remove}) => {
                    // log.debug(`fields ${JSON.stringify(fields)}`)
                    return (
                        <div className="w-full items-baseline">
                            {fields.map(
                                ({key, name, fieldKey, ...restField}) => (
                                    <div
                                        className="w-full flex items-baseline"
                                        key={key}
                                    >
                                        <Form.Item
                                            label="编号"
                                            {...restField}
                                            className="w-2/12"
                                            labelCol={{span: 12}}
                                            wrapperCol={{span: 12}}
                                            name={[name, 'productNo']}
                                            fieldKey={[fieldKey, 'productNo']}
                                            required
                                            rules={[
                                                {
                                                    transform: trimWhitespace,
                                                    validator: (
                                                        rule,
                                                        value,
                                                        callback
                                                    ) =>
                                                        productNoValidator(
                                                            rule,
                                                            value,
                                                            callback,
                                                            name
                                                        ),
                                                },
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>

                                        <div className="w-4/12">
                                            <Form.Item
                                                label="名称"
                                                {...restField}
                                                // className="w-48"
                                                labelCol={{span: 4}}
                                                wrapperCol={{span: 20}}
                                                name={[name, 'name']}
                                                fieldKey={[fieldKey, 'name']}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: '名称不能为空',
                                                    },
                                                ]}
                                            >
                                                <TextArea autoSize />
                                            </Form.Item>
                                        </div>
                                        <div className="w-5/12 flex items-baseline">
                                            <Form.Item
                                                label="描述"
                                                {...restField}
                                                className="w-11/12"
                                                labelCol={{span: 4}}
                                                wrapperCol={{span: 20}}
                                                name={[name, 'description']}
                                                fieldKey={[
                                                    fieldKey,
                                                    'description',
                                                ]}
                                                // rules={[{ required: true, message: "描述必须" }]}
                                            >
                                                <TextArea autoSize />
                                            </Form.Item>
                                            <MinusCircleOutlined
                                                onClick={() => remove(name)}
                                            />
                                        </div>
                                    </div>
                                )
                            )}
                            <Form.Item
                                labelCol={{span: 4}}
                                wrapperCol={{span: 8, offset: 4}}
                            >
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    // block
                                    icon={
                                        <PlusOutlined className="align-baseline" />
                                    }
                                    disabled={!supplier.id}
                                >
                                    Add field
                                </Button>
                                <Button
                                    type="dashed"
                                    onClick={() => {
                                        add()
                                        add()
                                        add()
                                    }}
                                    // block

                                    icon={
                                        <PlusOutlined
                                            // style={{ "vertical-align": "baseline" }}
                                            className="align-baseline"
                                        />
                                    }
                                    disabled={!supplier.id}
                                >
                                    Add 3 fields
                                </Button>
                            </Form.Item>
                        </div>
                    )
                }}
            </Form.List>

            <Form.Item labelCol={{span: 4}} wrapperCol={{span: 8, offset: 4}}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    )
}
