import React, {useEffect} from 'react'
import {Form, Input, Button, Select, message} from 'antd'
import {strict as assert} from 'assert'
import {useDispatch, useSelector} from 'react-redux'
import {rendererLog} from '../log'

import {
    updateSupplier,
    selectSupplierUpdatingId,
    setSupplierUpdatingId,
    selectSupplierOptions,
    selectSupplierById,
} from '../selectors/suppliersSlice'

const FormItem = Form.Item
export function SupplierUpdate(props) {
    const dispatch = useDispatch()
    const supplierId = useSelector(selectSupplierUpdatingId)
    const supplier = useSelector((state) =>
        selectSupplierById(state, supplierId)
    )
    const [form] = Form.useForm()

    useEffect(() => {
        if (supplier) {
            form.setFieldsValue(supplier)
        } else {
            form.resetFields()
        }
    }, [supplierId])

    const supplierOptions = useSelector(selectSupplierOptions)
    // log.debug(supplierOptions)
    const onSupplierSelect = (value) => {
        rendererLog.debug('supplier updating id', value)
        if (value !== supplierId) {
            dispatch(setSupplierUpdatingId(value))
        }
    }
    const onSupplierClear = () => {
        rendererLog.debug('supplier update select clear')
        dispatch(setSupplierUpdatingId(null))
    }
    const onFinish = async (values) => {
        // log.debug(values)
        assert(supplier)
        const changedValues = {}
        for (const [key, value] of Object.entries(values)) {
            let processedValue
            if (typeof value === 'string' || value instanceof String) {
                processedValue = value.trim()
            } else {
                processedValue = value
            }
            if (processedValue !== supplier[key]) {
                changedValues[key] = processedValue
            }
        }
        rendererLog.debug('changed values ', changedValues)
        if (Object.keys(changedValues).length !== 0) {
            dispatch(updateSupplier({id: supplier.id, changes: changedValues}))
                .unwrap()
                .then((originalPromiseResult) => {
                    message.success('供应商更新成功')
                })
                .catch((rejectedValueOrSerializedError) => {
                    rendererLog.error(rejectedValueOrSerializedError)
                })
        } else {
            message.warn('供应商信息没有变动')
        }
    }

    const layout = {
        labelCol: {
            span: 5,
        },
        wrapperCol: {
            span: 10,
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
            {...layout}
            onFinish={onFinish}
            // onValuesChange={onSupplierUpdate}
        >
            <FormItem
                label="待修改供应商"
                name="id"
                // hasFeedback
                // rules={[
                //     { required: true, message: '供应商必须!' },
                // ]}
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
            <FormItem
                label="公司名称"
                name="name"
                hasFeedback
                // normalize={(value)=>value.trim()}
                rules={[
                    {
                        required: true,
                        whitespace: false,
                        message: '公司名称不能为空!',
                    },
                ]}
            >
                <Input />
            </FormItem>
            <FormItem
                label="地址"
                name="address"
                required
                hasFeedback
                rules={[
                    {
                        required: true,
                        whitespace: false,
                        message: '地址不能为空!',
                    },
                ]}
            >
                <Input />
            </FormItem>
            <FormItem
                label="联系人"
                name="contact"
                required
                hasFeedback
                rules={[
                    {
                        required: true,
                        whitespace: false,
                        message: '联系人不能为空!',
                    },
                ]}
            >
                <Input />
            </FormItem>
            <FormItem
                label="电话"
                name="telephone"
                hasFeedback
                // rules={[
                //     {
                //         transform: trimWhitespace,
                //         validator:em
                //     }

                // ]}
            >
                <Input />
            </FormItem>
            <FormItem
                label="手机"
                name="cellphone"
                hasFeedback
                // rules={[
                //     {
                //         transform: trimWhitespace,
                //         whitespace: false,
                //     }
                // ]}
            >
                <Input />
            </FormItem>

            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit" disabled={!supplier}>
                    Submit
                </Button>
            </Form.Item>
        </Form>
    )
}
