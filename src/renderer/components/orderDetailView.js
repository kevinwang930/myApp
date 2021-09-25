import React, {useEffect, useState} from 'react'
import {
    Form,
    Input,
    Button,
    Select,
    Row,
    Col,
    Descriptions,
    Space,
    InputNumber,
    message,
} from 'antd'
import {useDispatch, useSelector} from 'react-redux'
import {unwrapResult} from '@reduxjs/toolkit'
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

import {
    orderNoCreateValidator,
    trimWhitespace,
    prepareFormResult,
} from '../auxiliary'
import {
    MinusCircleOutlined,
    PlusOutlined,
    EditOutlined,
    SaveOutlined,
} from '@ant-design/icons'
import {log} from '../log'
import {isEmpty} from 'lodash'
import {getOrderTotalAmount} from '../api/db'
import {orderExcelReport} from '../api/orderExcelReport'
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
    const [selectedProducts, setSelectedProducts] = useState({})

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
            setOrderItemsEditStatus(
                orderItems.map((orderItem) => {
                    return false
                })
            )
        } else {
            form.resetFields()
        }

        // set selected product options
        let selected = {}
        if (orderItems.length > 0) {
            orderItems.forEach((orderItem, index) => {
                if (selected[orderItem.productId]) {
                    selected[orderItem.productId].add(index)
                } else {
                    selected[orderItem.productId] = new Set([index])
                }
            })
        }
        setSelectedProducts(selected)
    }, [orderId])

    function onProductChange(
        newProductId,
        option,
        orderItemKey,
        orderItemName
    ) {
        let selected = {...selectedProducts}

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
        let selected = {...selectedProducts}

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
            return Promise.reject('请选择产品')
        }
        if (selectedProducts[value].size > 1) {
            return Promise.reject('产品已存在')
        } else {
            return Promise.resolve()
        }
    }

    const onTotalAmountChange = () => {
        let orderItems = form.getFieldValue('orderItems')
        const reducer = (accumulator, currentItem) => {
            if (currentItem && currentItem.price && currentItem.quantity) {
                accumulator =
                    accumulator + currentItem.price * currentItem.quantity
            }
            return accumulator
        }
        let totalAmount = orderItems.reduce(reducer, 0)
        form.setFieldsValue({
            totalAmount: totalAmount,
        })
    }

    const onDeleteOrderItem = async (
        orderItemKey,
        orderItemName,
        removeCallBack
    ) => {
        log.debug('on delete order item ', orderItemName)
        let orderItem = form.getFieldValue(['orderItems', orderItemName])
        if (orderItem && orderItem.id) {
            try {
                let result = await dispatch(deleteOrderItem(orderItem.id))
                unwrapResult(result)

                let totalAmount = await getOrderTotalAmount(orderId)
                const newOrderItemIds = [...order.orderItemIds].filter(
                    (id) => id !== orderItem.id
                )

                dispatch(
                    UpdateOrderRedux({
                        id: orderId,
                        changes: {
                            orderItemIds: newOrderItemIds,
                            totalAmount: totalAmount,
                        },
                    })
                )

                message.success('订单条目删除成功')
            } catch (e) {
                message.error(`订单条目删除失败 ${e.message}`)
                return
            }
        }

        let selected = {...selectedProducts}
        for (const [key, value] of Object.entries(selected)) {
            value.delete(orderItemKey)
        }
        setSelectedProducts(selected)
        let newStatus = [...orderItemsEditStatus]
        newStatus.splice(orderItemName, 1)
        setOrderItemsEditStatus(newStatus)

        removeCallBack(orderItemName)
        onTotalAmountChange()
        return
    }

    const getOrderItemUpdate = (orderItem) => {
        const origin = orderItems.find((Item) => Item.id === orderItem.id)
        let updates = {}
        for (const [key, value] of Object.entries(orderItem)) {
            let cellValue
            if (value) {
                if (typeof value === 'string' || value instanceof String) {
                    cellValue = value.trim()
                } else {
                    cellValue = value
                }
                if (value != origin[key]) {
                    updates[key] = value
                }
            }
        }
        return updates
    }

    const getOrderItemCreate = (orderItem) => {
        let newOrderItem = {}
        for (const [key, value] of Object.entries(orderItem)) {
            if (value) {
                if (typeof value === 'string' || value instanceof String) {
                    newOrderItem[key] = value.trim()
                } else {
                    newOrderItem[key] = value
                }
            }
        }
        return newOrderItem
    }

    const onSave = async (name) => {
        let value = await form.validateFields([
            ['orderItems', name, 'id'],
            ['orderItems', name, 'productId'],
            ['orderItems', name, 'productNo'],
            ['orderItems', name, 'productName'],
            ['orderItems', name, 'description'],
            ['orderItems', name, 'price'],
            ['orderItems', name, 'quantity'],
        ])
        let orderItem = value.orderItems[name]
        log.debug(
            `on save validated  No ${name}, orderItem ${JSON.stringify(
                orderItem
            )}`
        )
        if (orderItem.id) {
            let updates = getOrderItemUpdate(orderItem)
            if (!isEmpty(updates)) {
                try {
                    let result = await dispatch(
                        updateOrderItem({id: orderItem.id, changes: updates})
                    )
                    unwrapResult(result)
                    let totalAmount = await getOrderTotalAmount(orderId)
                    dispatch(
                        UpdateOrderRedux({
                            id: orderId,
                            changes: {
                                totalAmount: totalAmount,
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
            let newOrderItemInfo = prepareFormResult(orderItem)
            //undefined orderItem id cause sql insert fail
            delete newOrderItemInfo.id
            newOrderItemInfo.orderId = orderId
            try {
                let info = await dispatch(
                    createOrderItem(newOrderItemInfo)
                ).unwrap()
                let id = info.id
                form.setFields([
                    {
                        name: ['orderItems', name, 'id'],
                        value: id,
                    },
                ])
                let totalAmount = await getOrderTotalAmount(orderId)

                let newIds = [...order.orderItemIds]
                newIds.push(id)
                dispatch(
                    UpdateOrderRedux({
                        id: orderId,
                        changes: {
                            totalAmount: totalAmount,
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
        let newStatus = [...orderItemsEditStatus]
        newStatus[name] = false
        setOrderItemsEditStatus(newStatus)
    }

    const isExportReady = () => {
        let orderNo = order?.orderNo
        if (orderNo) {
            return true
        } else {
            message.error({
                content: `订单为空`,
                key: 'orderExport',
            })
            return false
        }
    }

    const onExport = async () => {
        if (isExportReady()) {
            await orderExcelReport.report_exceljs({
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
                            content: err.message,
                            key: 'orderExport',
                        })
                    }
                }
            )
        }
    }

    const OrderItemOperation = ({orderItemKey, name, remove}) => {
        let editStatus = orderItemsEditStatus[name]
        if (!editStatus) {
            return (
                <Col>
                    <EditOutlined
                        onClick={() => {
                            let newStatus = [...orderItemsEditStatus]
                            newStatus[name] = true
                            setOrderItemsEditStatus(newStatus)
                        }}
                        className="inline-block "
                        // style={{ display: 'inline-block', verticalAlign: 'middle' }}
                    />
                    <MinusCircleOutlined
                        onClick={() =>
                            onDeleteOrderItem(orderItemKey, name, remove)
                        }
                        className="inline-block mx-2 "
                    />
                </Col>
            )
        } else {
            return (
                <Col>
                    <SaveOutlined
                        onClick={(e) => onSave(name)}
                        className="inline-block "
                        // style={{ display: 'inline-block', verticalAlign: 'middle' }}
                    />
                    <MinusCircleOutlined
                        onClick={() =>
                            onDeleteOrderItem(orderItemKey, name, remove)
                        }
                        className="inline-block mx-2 "
                    />
                </Col>
            )
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
                    <div className="w-2/12"></div>
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
                                                            disabled={
                                                                !orderItemsEditStatus[
                                                                    name
                                                                ]
                                                            }
                                                            onClear={() => {
                                                                onProductClear(
                                                                    key,
                                                                    name
                                                                )
                                                            }}
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
                                                    name={name}
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
                                                let status = [
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
                                                let status = [
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
