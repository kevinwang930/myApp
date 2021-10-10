import React, {useEffect, useState} from 'react'
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
} from 'antd'
import {useDispatch, useSelector} from 'react-redux'
import {unwrapResult} from '@reduxjs/toolkit'
import {
    MinusCircleOutlined,
    PlusOutlined,
    EditOutlined,
    SaveOutlined,
} from '@ant-design/icons'
import {isEmpty} from 'lodash'
import {
    selectOrderById,
    selectOrderIdInDetailPage,
    UpdateOrderRedux,
} from '../selectors/ordersSlice'
import {selectSupplierById} from '../selectors/suppliersSlice'
import {
    deleteOrderItem,
    updateOrderItem,
    createOrderItem,
    selectOrderItemsByIds,
} from '../selectors/orderItemsSlice'
import {selectProductsAndOptionsBySupplierId} from '../selectors/productsSlice'

import {orderNoCreateValidator, trimWhitespace} from '../auxiliary'
import {prepareFormResult, findDuplicateInArray} from '../utils'
import {log} from '../log'
import {getOrderTotalAmount} from '../api/db'
import {orderExportExcel} from '../api/orderExcelExport'
import {client} from '../api/grpcClient'

const FormItem = Form.Item
const DescItem = Descriptions.Item
const {TextArea} = Input

export const OrderDetailView = () => {
    const [form] = Form.useForm()
    const dispatch = useDispatch()
    const orderId = useSelector(selectOrderIdInDetailPage)
    const order = useSelector((state) => selectOrderById(state, orderId))
    const supplier = useSelector((state) =>
        selectSupplierById(state, order?.supplierId)
    )
    const orderItems = useSelector((state) =>
        selectOrderItemsByIds(state, order?.orderItemIds)
    )
    const {products, productOptions} = useSelector((state) =>
        selectProductsAndOptionsBySupplierId(state, supplier?.id)
    )
    const [orderItemsEditStatus, setOrderItemsEditStatus] = useState([])
    const [orderInfo, setOrderInfo] = useState({})
    const [selectedProducts, setSelectedProducts] = useState([])

    useEffect(() => {
        if (order) {
            form.setFieldsValue({
                ...order,
                orderItems,
            })
            setOrderInfo({
                update: 'save',
                edit: false,
            })
            setOrderItemsEditStatus(orderItems.map(() => false))
        } else {
            form.resetFields()
        }

        // set selected product options
        const selected = []
        if (orderItems.length > 0) {
            orderItems.forEach((orderItem, index) => {
                selected[index] = orderItem.productId
            })
        }
        setSelectedProducts(selected)
    }, [orderId])

    function onProductSelect(newProductId, option, key, name) {
        const selected = [...selectedProducts]

        const product = products[newProductId]
        form.setFields([
            {
                name: ['orderItems', name, 'description'],
                value: product.description,
            },
            {
                name: ['orderItems', name, 'productNo'],
                value: product.productNo,
            },
            {
                name: ['orderItems', name, 'productName'],
                value: product.name,
            },
        ])

        selected[name] = newProductId
        setSelectedProducts(selected)
    }

    function onProductClear(key, name) {
        const selected = [...selectedProducts]
        form.setFields([
            {
                name: ['orderItems', name, 'description'],
                value: null,
            },
            {
                name: ['orderItems', name, 'productNo'],
                value: null,
            },
            {
                name: ['orderItems', name, 'productName'],
                value: null,
            },
        ])
        selected[name] = null
        setSelectedProducts(selected)
    }

    const productIdValidator = (rule, value) => {
        if (!value) {
            return Promise.reject('请选择产品')
        }
        if (
            selectedProducts.length &&
            findDuplicateInArray(selectedProducts, value)
        ) {
            return Promise.reject('产品已存在')
        }
        return Promise.resolve()
    }

    const onTotalAmountChange = () => {
        const formOrderItems = form.getFieldValue('orderItems')
        const reducer = (accumulator, currentItem) => {
            if (currentItem && currentItem.price && currentItem.quantity) {
                accumulator += currentItem.price * currentItem.quantity
            }
            return accumulator
        }
        const totalAmount = formOrderItems.reduce(reducer, 0)
        form.setFieldsValue({
            totalAmount,
        })
    }

    const onDeleteOrderItem = async (
        orderItemKey,
        orderItemNo,
        removeCallBack
    ) => {
        const orderItem = form.getFieldValue(['orderItems', orderItemNo])
        if (orderItem && orderItem.id) {
            try {
                await dispatch(deleteOrderItem(orderItem.id)).unwrap()
                const totalAmount = await getOrderTotalAmount(orderId)
                const newOrderItemIds = [...order.orderItemIds].filter(
                    (id) => id !== orderItem.id
                )

                dispatch(
                    UpdateOrderRedux({
                        id: orderId,
                        changes: {
                            orderItemIds: newOrderItemIds,
                            totalAmount,
                        },
                    })
                )

                message.success('订单条目删除成功')
            } catch (e) {
                message.error(`订单条目删除失败 ${e.message}`)
                return
            }
        }

        const selected = [...selectedProducts]
        selected.splice(orderItemNo, 1)
        setSelectedProducts(selected)
        const newStatus = [...orderItemsEditStatus]
        newStatus.splice(orderItemNo, 1)
        setOrderItemsEditStatus(newStatus)

        removeCallBack(orderItemNo)
        onTotalAmountChange()
    }

    const getOrderItemUpdate = (orderItem) => {
        const origin = orderItems.find((Item) => Item.id === orderItem.id)
        const updates = {}
        const processedOrderItem = prepareFormResult(orderItem)
        for (const [key, value] of Object.entries(processedOrderItem)) {
            if (value !== origin[key]) {
                updates[key] = value
            }
        }
        return updates
    }

    const onSave = async (name) => {
        const value = await form.validateFields([
            ['orderItems', name, 'id'],
            ['orderItems', name, 'productId'],
            ['orderItems', name, 'productNo'],
            ['orderItems', name, 'productName'],
            ['orderItems', name, 'description'],
            ['orderItems', name, 'price'],
            ['orderItems', name, 'quantity'],
        ])
        const orderItem = value.orderItems[name]
        log.debug(
            `on save validated  No ${name}, orderItem ${JSON.stringify(
                orderItem
            )}`
        )
        if (orderItem.id) {
            const updates = getOrderItemUpdate(orderItem)
            if (!isEmpty(updates)) {
                try {
                    const result = await dispatch(
                        updateOrderItem({id: orderItem.id, changes: updates})
                    )
                    unwrapResult(result)
                    const totalAmount = await getOrderTotalAmount(orderId)
                    dispatch(
                        UpdateOrderRedux({
                            id: orderId,
                            changes: {
                                totalAmount,
                            },
                        })
                    )
                    message.success('订单条目更新成功')
                } catch (e) {
                    message.error(`订单条目更新失败 ${e.message}`)
                    return
                }
            }
        } else {
            const newOrderItemInfo = prepareFormResult(orderItem)
            // undefined orderItem id cause sql insert fail
            delete newOrderItemInfo.id
            newOrderItemInfo.orderId = orderId
            try {
                const info = await dispatch(
                    createOrderItem(newOrderItemInfo)
                ).unwrap()
                const {id} = info
                form.setFields([
                    {
                        name: ['orderItems', name, 'id'],
                        value: id,
                    },
                ])
                const totalAmount = await getOrderTotalAmount(orderId)

                const newIds = [...order.orderItemIds]
                newIds.push(id)
                dispatch(
                    UpdateOrderRedux({
                        id: orderId,
                        changes: {
                            totalAmount,
                            orderItemIds: newIds,
                        },
                    })
                )
                message.success('订单条目创建成功')
            } catch (e) {
                message.error(`订单条目创建失败 ${e.message}`)
                return
            }
        }
        const newStatus = [...orderItemsEditStatus]
        newStatus[name] = false
        setOrderItemsEditStatus(newStatus)
    }

    const isExportReady = () => {
        const orderNo = order?.orderNo
        if (orderNo) {
            return true
        }
        message.error({
            content: `订单为空`,
            key: 'orderExport',
        })
        return false
    }

    const onExport = async () => {
        if (isExportReady()) {
            await orderExportExcel.export_exceljs({
                orderNo: order.orderNo,
                supplier: {...supplier},
                orderItems,
            })
        }
    }

    const onExport_python = () => {
        if (isExportReady()) {
            client.orderExcelReport(
                {orderNo: order.orderNo},
                (err, response) => {
                    if (err) {
                        message.error({
                            content: err.message,
                            key: 'orderExport',
                        })
                    } else if (response.result) {
                        message.success({
                            content: response.message,
                            key: 'orderExport',
                        })
                    } else {
                        message.error({
                            content: response.message,
                            key: 'orderExport',
                        })
                    }
                }
            )
        }
    }

    const OrderItemOperation = ({orderItemKey, orderItemNo, remove}) => {
        const editStatus = orderItemsEditStatus[orderItemNo]
        if (!editStatus) {
            return (
                <Col>
                    <EditOutlined
                        onClick={() => {
                            const newStatus = [...orderItemsEditStatus]
                            newStatus[orderItemNo] = true
                            setOrderItemsEditStatus(newStatus)
                        }}
                        className="inline-block "
                        // style={{ display: 'inline-block', verticalAlign: 'middle' }}
                    />
                    <MinusCircleOutlined
                        onClick={() =>
                            onDeleteOrderItem(orderItemKey, orderItemNo, remove)
                        }
                        className="inline-block mx-2 "
                    />
                </Col>
            )
        }
        return (
            <Col>
                <SaveOutlined
                    onClick={() => onSave(orderItemNo)}
                    className="inline-block "
                    // style={{ display: 'inline-block', verticalAlign: 'middle' }}
                />
                <MinusCircleOutlined
                    onClick={() =>
                        onDeleteOrderItem(orderItemKey, orderItemNo, remove)
                    }
                    className="inline-block mx-2 "
                />
            </Col>
        )
    }

    // const layout = {
    //     labelCol: {
    //         offset: 1,
    //         span: 2,
    //     },
    //     wrapperCol: {
    //         span: 10,
    //     },
    // }
    // const tailLayout = {
    //     wrapperCol: {
    //         offset: 5,
    //         span: 10,
    //     },
    // }
    return (
        <div className="mx-8">
            <div className="flex">
                <Button onClick={onExport}>导出</Button>
                <Button onClick={onExport_python}>python导出</Button>
            </div>

            <div className="text-xl my-10 w-10/12 text-center">订单详情</div>
            <Form
                form={form}
                layout="horizontal"
                // {...layout}
                // initialValues={orderEditing}
                validateTrigger="onBlur"
            >
                <div className="flex items-baseline">
                    <div>供应商名称: {supplier?.name}</div>
                    <div className="w-2/12" />
                    <FormItem
                        label="订单编号"
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
                        <Input disabled={!orderInfo.edit} />
                    </FormItem>
                </div>

                <Descriptions className="border-2" title="供应商信息">
                    <DescItem label="ID">
                        {supplier ? supplier.id : ''}
                    </DescItem>
                    <DescItem label="名称">
                        {supplier ? supplier.name : ''}
                    </DescItem>
                    <DescItem label="地址">
                        {supplier ? supplier.address : ''}
                    </DescItem>
                    <DescItem label="联系人">
                        {supplier ? supplier.contact : ''}
                    </DescItem>
                    <DescItem label="固定电话">
                        {supplier ? supplier.telephone : ''}
                    </DescItem>
                    <DescItem label="手机">
                        {supplier ? supplier.cellphone : ''}
                    </DescItem>
                </Descriptions>
                <div className="my-10 border-2">
                    <Form.List name="orderItems">
                        {(fields, {add, remove}) => {
                            return (
                                <div className=" items-baseline">
                                    <Row className=" flex text-center my-5">
                                        <Col
                                            span={1}
                                            // className="hidden"
                                        >
                                            ID
                                        </Col>
                                        <Col span={4}>
                                            <span className="text-red-500 text-lg align-middle">
                                                *{' '}
                                            </span>
                                            选择产品
                                        </Col>
                                        <Col span={3}>编号</Col>
                                        <Col span={3}>名称</Col>
                                        <Col span={6}>描述</Col>
                                        <Col span={2}>
                                            <span className="text-red-500 text-lg align-middle">
                                                *{' '}
                                            </span>
                                            价格
                                        </Col>
                                        <Col span={2}>
                                            <span className="text-red-500 text-lg align-middle">
                                                *{' '}
                                            </span>
                                            数量
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
                                                <Col
                                                    span={1}
                                                    // className = "hidden"
                                                >
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'id']}
                                                        fieldKey={[
                                                            fieldKey,
                                                            'id',
                                                        ]}
                                                    >
                                                        <InputNumber
                                                            disabled
                                                            // type="hidden"
                                                        />
                                                    </Form.Item>
                                                </Col>

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
                                                        validateTrigger="onChange"
                                                    >
                                                        <Select
                                                            showSearch
                                                            defaultActiveFirstOption="false"
                                                            allowClear
                                                            options={
                                                                productOptions
                                                            }
                                                            optionFilterProp="label"
                                                            onSelect={(
                                                                value,
                                                                option
                                                            ) => {
                                                                onProductSelect(
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
                                                            disabled={
                                                                !orderItemsEditStatus[
                                                                    name
                                                                ]
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
                                                        // label="描述"
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
                                                        // rules={[{ required: true, message: "描述必须" }]}
                                                    >
                                                        <TextArea
                                                            autoSize
                                                            disabled={
                                                                !orderItemsEditStatus[
                                                                    name
                                                                ]
                                                            }
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={2}>
                                                    <Form.Item
                                                        {...restField}
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
                                                                    '价格必须',
                                                            },
                                                        ]}
                                                    >
                                                        <InputNumber
                                                            onChange={
                                                                onTotalAmountChange
                                                            }
                                                            disabled={
                                                                !orderItemsEditStatus[
                                                                    name
                                                                ]
                                                            }
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={2}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            'quantity',
                                                        ]}
                                                        fieldKey={[
                                                            fieldKey,
                                                            'quantity',
                                                        ]}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message:
                                                                    '数量必须',
                                                            },
                                                        ]}
                                                    >
                                                        <InputNumber
                                                            onChange={
                                                                onTotalAmountChange
                                                            }
                                                            disabled={
                                                                !orderItemsEditStatus[
                                                                    name
                                                                ]
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
                                                <OrderItemOperation
                                                    orderItemKey={key}
                                                    orderItemNo={name}
                                                    remove={remove}
                                                />
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
                                            onClick={() => {
                                                const status = [
                                                    ...orderItemsEditStatus,
                                                ]
                                                status.push(true)

                                                setOrderItemsEditStatus(status)
                                                add()
                                            }}
                                            // block
                                            icon={
                                                <PlusOutlined className="align-baseline" />
                                            }
                                            // disabled={!supplier.id}
                                        >
                                            添加条目
                                        </Button>
                                        <Button
                                            type="dashed"
                                            onClick={() => {
                                                const status = [
                                                    ...orderItemsEditStatus,
                                                ]
                                                status.push(true, true, true)
                                                setOrderItemsEditStatus(status)
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
                                            添加3条目
                                        </Button>
                                    </Form.Item>
                                </div>
                            )
                        }}
                    </Form.List>
                    <Row gutter={12} className="items-baseline">
                        <Col offset={15} span={2}>
                            <p className=" text-right">总金额：</p>
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
            </Form>
        </div>
    )
}
