import {Table, Divider, Popconfirm, Button, Input, notification} from 'antd'
import {SearchOutlined} from '@ant-design/icons'
import {useSelector, useDispatch} from 'react-redux'
import {setOrderIdInDetailPage, deleteOrder} from '../selectors/ordersSlice'
import {removeOrderItems} from '../selectors/orderItemsSlice'
import {selectOrderExcerpts} from '../selectors/selectors'
import {NavLink} from 'react-router-dom'
import {setSelectedPage} from '../selectors/menuSlice'
import {log} from '../log'
import React, {useRef} from 'react'

export function OrdersView() {
    const dispatch = useDispatch()
    const searchRef = useRef(null)
    const orderExcerpts = useSelector(selectOrderExcerpts)

    const onOrderUpdate = (id) => {
        log.debug('order detail id', id)
        dispatch(setSelectedPage('orderDetail'))
        dispatch(setOrderIdInDetailPage(id))
    }

    const onDelete = (record) => {
        log.debug('delete order ', record)
        dispatch(removeOrderItems(record.orderItemIds))
        dispatch(
            deleteOrder({id: record.id, orderItemIds: record.orderItemIds})
        )
            .unwrap()
            .then((originalPromiseResult) => {
                notification.success({
                    message: '订单删除成功',
                    description: `编号-${record.id}`,
                    duration: 3,
                    key: 'orderDelete',
                })
            })
            .catch((error) => {
                notification.error({
                    message: '订单删除失败',
                    description: `编号-${record.id} ${error.message}`,
                    duration: 0,
                    key: 'orderDelete',
                })
            })
    }

    const onSearch = (
        value,
        setSelectedKeys,
        selectedKeys,
        confirm,
        dataIndex,
        clearFilters
    ) => {
        if (value) {
            setSelectedKeys([value])
            confirm()
        } else {
            clearFilters()
        }
    }

    const getColumnSearchProps = (dataIndex) => ({
        filterIcon: (filtered) => (
            <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex]
                      .toString()
                      .toLowerCase()
                      .includes(value.toLowerCase())
                : '',
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => searchRef.current.select(), 100)
            }
        },
    })
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: '订单编号',
            dataIndex: 'orderNo',
            sorter: {
                compare: (a, b) => a.orderNo.localeCompare(b.orderNo),
            },
            ...getColumnSearchProps('orderNo'),
            filterDropdown: ({
                setSelectedKeys,
                selectedKeys,
                confirm,
                clearFilters,
            }) => (
                <div style={{padding: 8}}>
                    <Input.Search
                        allowClear
                        ref={searchRef}
                        placeholder={`搜索订单编号`}
                        defaultValue={selectedKeys[0]}
                        onSearch={(value) =>
                            onSearch(
                                value,
                                setSelectedKeys,
                                selectedKeys,
                                confirm,
                                'orderNo',
                                clearFilters
                            )
                        }
                        style={{marginBottom: 8, display: 'block'}}
                    />
                </div>
            ),
        },
        {
            title: '供应商',
            dataIndex: 'supplierName',
            sorter: {
                compare: (a, b) => a.supplierName.localeCompare(b.supplierName),
            },
            ...getColumnSearchProps('supplierName'),
            filterDropdown: ({
                setSelectedKeys,
                selectedKeys,
                confirm,
                clearFilters,
            }) => (
                <div style={{padding: 8}}>
                    <Input.Search
                        allowClear
                        ref={searchRef}
                        placeholder={`搜索供应商`}
                        defaultValue={selectedKeys[0]}
                        onSearch={(value) =>
                            onSearch(
                                value,
                                setSelectedKeys,
                                selectedKeys,
                                confirm,
                                'supplierName',
                                clearFilters
                            )
                        }
                        style={{marginBottom: 8, display: 'block'}}
                    />
                </div>
            ),
        },
        {
            title: '总金额',
            dataIndex: 'totalAmount',
            sorter: {
                compare: (a, b) => a.totalAmount - b.totalAmount,
            },
            render: (value) => {
                return {
                    children: value
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                }
            },
        },
        {
            title: '操作',
            key: '操作',
            width: '8em',
            render: (text, record) => {
                return (
                    <span>
                        <NavLink
                            to="/orderDetail"
                            onClick={() => {
                                onOrderUpdate(record.id)
                            }}
                        >
                            详情
                        </NavLink>
                        <Divider type="vertical" />
                        <Popconfirm
                            title="确定删除?"
                            okText="确定"
                            cancelText="取消"
                            onConfirm={() => onDelete(record)}
                        >
                            <Button
                                type="link"
                                style={{padding: 0, color: '#f5222d'}}
                            >
                                删除
                            </Button>
                        </Popconfirm>
                    </span>
                )
            },
        },
    ]
    return <Table dataSource={orderExcerpts} columns={columns} rowKey="id" />
}
