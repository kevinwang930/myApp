import {
    Form,
    Input,
    Button,
    Select,
    Row,
    Col,
    Descriptions,
    InputNumber,
    message,
    notification,
} from 'antd'
import {useDispatch, useSelector} from 'react-redux'
import React, {useState, useEffect} from 'react'
import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons'
import {insertOrderRedux} from '../selectors/ordersSlice'
import {
    selectSupplierById,
    selectSupplierOptions,
} from '../selectors/suppliersSlice'
import {InsertOrderItemsRedux} from '../selectors/orderItemsSlice'
import {selectProductsAndOptionsBySupplierId} from '../selectors/productsSlice'
import {createOrder} from '../api/db'
import {
    orderNoCreateValidator,
    trimWhitespace,
    objectTrimString_emptyToNull,
} from '../auxiliary'

const FormItem = Form.Item
const DescItem = Descriptions.Item
const {TextArea} = Input

export const OrderCreateView = () => {
    const [form] = Form.useForm()
    const dispatch = useDispatch()
    const [supplierId, setSupplierId] = useState(null)
    const supplier = useSelector((state) =>
        selectSupplierById(state, supplierId)
    )
    const supplierOptions = useSelector(selectSupplierOptions)
    const {products, productOptions} = useSelector((state) =>
        selectProductsAndOptionsBySupplierId(state, supplierId)
    )
    const [selectedProducts, setSelectedProducts] = useState({})

    useEffect(() => {
        form.resetFields([['orderItems']])
    }, [supplierId])

    const onSupplierChange = (value) => {
        // log.debug("order creating supplier id",value)
        setSupplierId(value)
    }

    function onProductChange(
        newProductId,
        option,
        orderItemKey,
        orderItemName
    ) {
        const selected = {...selectedProducts}

        const product = products[newProductId]
        form.setFields([
            {
                name: ['orderItems', orderItemName, 'description'],
                value: product.description,
            },
            {
                name: ['orderItems', orderItemName, 'productNo'],
                value: product.productNo,
            },
            {
                name: ['orderItems', orderItemName, 'productName'],
                value: product.name,
            },
        ])
        for (const [key, value] of Object.entries(selected)) {
            value.delete(orderItemKey)
        }
        if (selected[newProductId]) {
            selected[newProductId].add(orderItemKey)
        } else {
            selected[newProductId] = new Set([orderItemKey])
        }

        setSelectedProducts(selected)
    }

    const onProductClear = (orderItemKey, orderItemName) => {
        const selected = {...selectedProducts}

        form.setFields([
            {
                name: ['orderItems', orderItemName, 'description'],
                value: null,
            },
            {
                name: ['orderItems', orderItemName, 'productNo'],
                value: null,
            },
            {
                name: ['orderItems', orderItemName, 'productName'],
                value: null,
            },
        ])
        for (const [key, value] of Object.entries(selected)) {
            value.delete(orderItemName)
        }
        setSelectedProducts(selected)
    }

    const productIdValidator = (rule, value) => {
        if (!value) {
            return Promise.reject('???????????????')
        }

        if (selectedProducts[value].size > 1) {
            return Promise.reject('???????????????')
        }
        return Promise.resolve()
    }

    const onOrderItemDelete = (orderItemKey, name, removeFun) => {
        const productId = form.getFieldValue(['orderItems', name, 'productId'])
        if (productId) {
            const selected = {...selectedProducts}
            selected[productId].delete(orderItemKey)
            setSelectedProducts(selected)
        }
        removeFun(name)
        onTotalAmountChange()
    }
    const onTotalAmountChange = () => {
        const orderItems = form.getFieldValue('orderItems')
        const reducer = (accumulator, currentItem) => {
            if (currentItem && currentItem.price && currentItem.quantity) {
                accumulator += currentItem.price * currentItem.quantity
            }
            return accumulator
        }
        const totalAmount = orderItems.reduce(reducer, 0)
        form.setFieldsValue({
            totalAmount,
        })
    }

    const onFinish = async (pageInfo) => {
        if (!pageInfo.orderItems || pageInfo.orderItems.length === 0) {
            message.error({
                content: '??????????????????????????????',
                key: 'empty_orderItems',
            })
        }

        const orderInfo = {
            orderNo: pageInfo.orderNo.trim(),
            supplierId: pageInfo.supplierId,
        }
        const orderItemsInfo = pageInfo.orderItems.map((originalValue) => {
            return objectTrimString_emptyToNull(originalValue)
        })

        try {
            await createOrder({orderInfo, orderItemsInfo})

            // total Amount is not needed in database operation so add it here
            orderInfo.totalAmount = pageInfo.totalAmount
            dispatch(InsertOrderItemsRedux(orderItemsInfo))
            dispatch(insertOrderRedux(orderInfo))

            notification.success({
                message: `??????????????????`,
                description: `???????????? - ${orderInfo.orderNo}`,
                key: 'orderCreate',
                duration: 3,
            })
            form.resetFields()
            setSupplierId(null)
        } catch (e) {
            notification.error({
                message: `??????????????????`,
                description: e.message,
                key: 'orderCreate',
                duration: 0,
            })
        }
    }

    const layout = {
        labelCol: {
            offset: 1,
            span: 2,
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
        <div className="mx-8">
            <div className="text-xl my-10 w-10/12 text-center">????????????</div>
            <Form
                form={form}
                layout="horizontal"
                // {...layout}
                // initialValues={orderEditing}
                onFinish={onFinish}
                validateTrigger="onBlur"
            >
                <div className="flex items-baseline">
                    <FormItem
                        label="?????????"
                        name="supplierId"
                        // hasFeedback
                        className="w-4/12"
                        rules={[{required: true, message: '???????????????!'}]}
                    >
                        <Select
                            showSearch
                            defaultActiveFirstOption="false"
                            allowClear
                            options={supplierOptions}
                            optionFilterProp="label"
                            onChange={onSupplierChange}
                        />
                    </FormItem>
                    <div className="w-2/12" />
                    <FormItem
                        label="????????????"
                        name="orderNo"
                        hasFeedback
                        required
                        className="w-3/12"
                        rules={[
                            {
                                transform: trimWhitespace,
                                validator: orderNoCreateValidator,
                            },
                        ]}
                    >
                        <Input />
                    </FormItem>
                </div>

                <Descriptions className="border-2" title="???????????????">
                    <DescItem label="ID">{supplierId}</DescItem>
                    <DescItem label="??????">{supplier?.name}</DescItem>
                    <DescItem label="??????">{supplier?.address}</DescItem>
                    <DescItem label="?????????">{supplier?.contact}</DescItem>
                    <DescItem label="????????????">{supplier?.telephone}</DescItem>
                    <DescItem label="??????">{supplier?.cellphone}</DescItem>
                </Descriptions>

                <div className="border-2 my-10">
                    <Form.List name="orderItems">
                        {(fields, {add, remove}) => {
                            return (
                                <div className=" items-baseline ">
                                    <Row className=" flex text-center my-5">
                                        <Col span={4}>
                                            <span className="text-red-500 text-lg align-middle">
                                                *{' '}
                                            </span>
                                            ????????????
                                        </Col>
                                        <Col span={3}>??????</Col>
                                        <Col span={3}>??????</Col>
                                        <Col span={6}>??????</Col>

                                        <Col span={2}>
                                            <span className="text-red-500 text-lg align-middle">
                                                *{' '}
                                            </span>
                                            ??????
                                        </Col>
                                        <Col span={2}>
                                            <span className="text-red-500 text-lg align-middle">
                                                *{' '}
                                            </span>
                                            ??????
                                        </Col>
                                    </Row>
                                    {fields.map(
                                        ({
                                            key,
                                            name,
                                            fieldKey,
                                            ...restField
                                        }) => (
                                            <Row
                                                gutter={12}
                                                align="top"
                                                key={key}
                                            >
                                                <Col span={4}>
                                                    <Form.Item
                                                        {...restField}
                                                        // labelCol={{ span: 12 }}
                                                        // wrapperCol={{ span: 12 }}
                                                        name={[
                                                            name,
                                                            'productId',
                                                        ]}
                                                        fieldKey={[
                                                            fieldKey,
                                                            'productId',
                                                        ]}
                                                        rules={[
                                                            {
                                                                validator:
                                                                    productIdValidator,
                                                            },
                                                        ]}
                                                        required
                                                    >
                                                        <Select
                                                            showSearch
                                                            defaultActiveFirstOption="false"
                                                            allowClear
                                                            options={
                                                                productOptions
                                                            }
                                                            optionFilterProp="label"
                                                            onChange={(
                                                                value,
                                                                option
                                                            ) => {
                                                                onProductChange(
                                                                    value,
                                                                    option,
                                                                    key,
                                                                    name
                                                                )
                                                            }}
                                                            onClear={() =>
                                                                onProductClear(
                                                                    key,
                                                                    name
                                                                )
                                                            }
                                                            dropdownMatchSelectWidth={
                                                                false
                                                            }
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={3}>
                                                    <Form.Item
                                                        {...restField}
                                                        // labelCol={{ span: 4 }}
                                                        // wrapperCol={{ span: 20 }}
                                                        name={[
                                                            name,
                                                            'productNo',
                                                        ]}
                                                        fieldKey={[
                                                            fieldKey,
                                                            'productNo',
                                                        ]}
                                                    >
                                                        <TextArea
                                                            autoSize
                                                            disabled
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={3}>
                                                    <Form.Item
                                                        {...restField}
                                                        // labelCol={{ span: 4 }}
                                                        // wrapperCol={{ span: 20 }}
                                                        name={[
                                                            name,
                                                            'productName',
                                                        ]}
                                                        fieldKey={[
                                                            fieldKey,
                                                            'productName',
                                                        ]}
                                                    >
                                                        <TextArea
                                                            autoSize
                                                            disabled
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={6}>
                                                    <Form.Item
                                                        // label="??????"
                                                        {...restField}
                                                        // labelCol={{ span: 4 }}
                                                        // wrapperCol={{ span: 20 }}
                                                        name={[
                                                            name,
                                                            'description',
                                                        ]}
                                                        fieldKey={[
                                                            fieldKey,
                                                            'description',
                                                        ]}
                                                        // rules={[{ required: true, message: "????????????" }]}
                                                    >
                                                        <TextArea autoSize />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={2}>
                                                    <Form.Item
                                                        // label="??????"
                                                        {...restField}
                                                        // labelCol={{ span: 4 }}
                                                        // wrapperCol={{ span: 20 }}
                                                        name={[name, 'price']}
                                                        fieldKey={[
                                                            fieldKey,
                                                            'price',
                                                        ]}
                                                        required
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message:
                                                                    '????????????',
                                                            },
                                                        ]}
                                                    >
                                                        <InputNumber
                                                            onChange={
                                                                onTotalAmountChange
                                                            }
                                                            formatter={(
                                                                value
                                                            ) =>
                                                                value
                                                                    .toString()
                                                                    .replace(
                                                                        /\B(?=(\d{3})+(?!\d))/g,
                                                                        ','
                                                                    )
                                                            }
                                                            parser={(value) =>
                                                                value.replace(
                                                                    /,/g,
                                                                    ''
                                                                )
                                                            }
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={2}>
                                                    <Form.Item
                                                        // label="??????"
                                                        {...restField}
                                                        // labelCol={{ span: 4 }}
                                                        // wrapperCol={{ span: 20 }}
                                                        name={[
                                                            name,
                                                            'quantity',
                                                        ]}
                                                        fieldKey={[
                                                            fieldKey,
                                                            'quantity',
                                                        ]}
                                                        required
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message:
                                                                    '????????????',
                                                            },
                                                        ]}
                                                    >
                                                        <InputNumber
                                                            onChange={
                                                                onTotalAmountChange
                                                            }
                                                            formatter={(
                                                                value
                                                            ) =>
                                                                value
                                                                    .toString()
                                                                    .replace(
                                                                        /\B(?=(\d{3})+(?!\d))/g,
                                                                        ','
                                                                    )
                                                            }
                                                            parser={(value) =>
                                                                value.replace(
                                                                    /,/g,
                                                                    ''
                                                                )
                                                            }
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col>
                                                    <MinusCircleOutlined
                                                        onClick={() => {
                                                            onOrderItemDelete(
                                                                key,
                                                                name,
                                                                remove
                                                            )
                                                        }}
                                                        className="inline-block mx-2 "
                                                    />
                                                </Col>
                                            </Row>
                                        )
                                    )}

                                    <Form.Item
                                        labelCol={{span: 4}}
                                        wrapperCol={{span: 8, offset: 4}}
                                        className="my-10"
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
                                            ????????????
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
                                            ??????3??????
                                        </Button>
                                    </Form.Item>
                                </div>
                            )
                        }}
                    </Form.List>
                    <Row gutter={12} className="items-baseline">
                        <Col offset={14} span={2}>
                            <p className=" text-right">????????????</p>
                        </Col>
                        <Col span={2}>
                            <Form.Item
                                name="totalAmount"

                                // wrapperCol={{offset:0}}
                            >
                                <InputNumber
                                    disabled
                                    formatter={(value) =>
                                        value
                                            .toString()
                                            .replace(
                                                /\B(?=(\d{3})+(?!\d))/g,
                                                ','
                                            )
                                    }
                                    parser={(value) => value.replace(/,/g, '')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        ??????
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}
