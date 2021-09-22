import React from 'react'
import {Form, Input, Button, message, notification} from 'antd'
import {useDispatch} from 'react-redux'
import {createSupplier} from '../selectors/suppliersSlice'

import {trimWhitespace, supplierNameValidator} from '../auxiliary'

const FormItem = Form.Item
export function SupplierCreate(props) {
    const dispatch = useDispatch()

    const [form] = Form.useForm()

    const supplierPhoneValidator = async (rule, value, callback) => {
        const cellPhone = form.getFieldValue('cellphone')?.trim()
        const telePhone = form.getFieldValue('telephone')?.trim()
        if (!cellPhone && !telePhone) {
            return Promise.reject('需要至少一种联系方式')
        }
        return Promise.resolve()
    }

    const onFinish = async (values) => {
        const supplierInfo = {}
        for (const [key, value] of Object.entries(values)) {
            if (value) {
                supplierInfo[key] = value.trim()
            }
        }
        try {
            await dispatch(createSupplier(supplierInfo)).unwrap()
            message.success(`供应商${supplierInfo.name}创建成功`)
            form.resetFields()
        } catch (e) {
            notification.error({
                message: '供应商创建失败',
                description: `${e.message}`,
                duration: 0,
                key: 'supplierCreate',
            })
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
            validateTrigger="onBlur"
        >
            <FormItem
                label="公司名称"
                name="name"
                required
                hasFeedback
                rules={[
                    {
                        transform: trimWhitespace,
                        validator: supplierNameValidator,
                    },
                ]}
            >
                <Input />
            </FormItem>
            <FormItem label="地址" name="address" required hasFeedback>
                <Input />
            </FormItem>
            <FormItem label="联系人" name="contact" required hasFeedback>
                <Input />
            </FormItem>
            <FormItem label="电话" name="telephone" hasFeedback>
                <Input />
            </FormItem>
            <FormItem
                label="手机"
                name="cellphone"
                hasFeedback
                rules={[
                    {
                        transform: trimWhitespace,
                        validator: supplierPhoneValidator,
                    },
                ]}
            >
                <Input />
            </FormItem>
            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    )
}
