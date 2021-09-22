import React from 'react'
import {Form, Input, Button} from 'antd'

import {
    MinusCircleOutlined,
    PlusOutlined,
    PlusCircleOutlined,
} from '@ant-design/icons'
import {log} from '../api/log'
import {useDispatch, useSelector} from 'react-redux'
import {trimWhitespace, productNoUpdateValidator} from '../auxiliary'

const FormItem = Form.Item
const {TextArea} = Input

export const ProductsUpdateView = ({formRef, onFinish}) => {
    return (
        <Form
            form={formRef}
            layout="horizontal"
            // {...layout}
            // initialValues={productEditing}
            onFinish={onFinish}
            validateTrigger="onBlur"
        >
            <Form.List name="products">
                {(fields, {add, remove}) => {
                    // log.debug(`fields ${JSON.stringify(fields)}`)
                    return (
                        <div className="w-full items-baseline">
                            <div className="w-full flex text-center">
                                <div className="w-2/12">编号</div>
                                <div className="w-4/12">名称</div>
                                <div className="w-5/12">描述</div>
                            </div>
                            {fields.map(
                                ({key, name, fieldKey, ...restField}) => (
                                    <div className="w-full flex " key={key}>
                                        <Form.Item
                                            // label="编号"
                                            {...restField}
                                            className="w-2/12 px-3"
                                            // labelCol={{ span: 12 }}
                                            // wrapperCol={{ span: 12 }}
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
                                                        productNoUpdateValidator(
                                                            rule,
                                                            value,
                                                            callback,
                                                            name,
                                                            formRef
                                                        ),
                                                },
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>

                                        <div className="w-4/12 px-3">
                                            <Form.Item
                                                // label="名称"
                                                {...restField}
                                                // className="w-48"
                                                // labelCol={{ span: 4 }}
                                                // wrapperCol={{ span: 20 }}
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
                                        <div className="w-5/12">
                                            <Form.Item
                                                // label="描述"
                                                {...restField}
                                                className="w-10/12 px-3 inline-block"
                                                // labelCol={{ span: 4 }}
                                                // wrapperCol={{ span: 20 }}
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
                                                className="inline-block mx-2"
                                            />
                                            <PlusCircleOutlined
                                                onClick={() => {
                                                    let index = parseInt(name)
                                                    let products =
                                                        formRef.getFieldValue(
                                                            'products'
                                                        )
                                                    if (
                                                        products &&
                                                        products.length >= index
                                                    ) {
                                                        add(products[index])
                                                    } else {
                                                        add()
                                                    }
                                                }}
                                                className="inline-block"
                                                // style={{ display: 'inline-block', verticalAlign: 'middle' }}
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
                                    // disabled={!supplier.id}
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
                                    // disabled={!supplier.id}
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
