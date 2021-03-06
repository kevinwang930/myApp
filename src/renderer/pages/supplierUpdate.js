import React, {useEffect} from 'react'
import {Form, Input, Button, Select, message} from 'antd'
import {strict as assert} from 'assert'
import {useDispatch, useSelector} from 'react-redux'
import {log} from '../log'

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
        log.debug('supplier updating id', value)
        if (value !== supplierId) {
            dispatch(setSupplierUpdatingId(value))
        }
    }
    const onSupplierClear = () => {
        log.debug('supplier update select clear')
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
        log.debug('changed values ', changedValues)
        if (Object.keys(changedValues).length !== 0) {
            dispatch(updateSupplier({id: supplier.id, changes: changedValues}))
                .unwrap()
                .then((originalPromiseResult) => {
                    message.success('?????????????????????')
                })
                .catch((rejectedValueOrSerializedError) => {
                    log.error(rejectedValueOrSerializedError)
                })
        } else {
            message.warn('???????????????????????????')
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
                label="??????????????????"
                name="id"
                // hasFeedback
                // rules={[
                //     { required: true, message: '???????????????!' },
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
                label="????????????"
                name="name"
                hasFeedback
                // normalize={(value)=>value.trim()}
                rules={[
                    {
                        required: true,
                        whitespace: false,
                        message: '????????????????????????!',
                    },
                ]}
            >
                <Input />
            </FormItem>
            <FormItem
                label="??????"
                name="address"
                required
                hasFeedback
                rules={[
                    {
                        required: true,
                        whitespace: false,
                        message: '??????????????????!',
                    },
                ]}
            >
                <Input />
            </FormItem>
            <FormItem
                label="?????????"
                name="contact"
                required
                hasFeedback
                rules={[
                    {
                        required: true,
                        whitespace: false,
                        message: '?????????????????????!',
                    },
                ]}
            >
                <Input />
            </FormItem>
            <FormItem
                label="??????"
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
                label="??????"
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
