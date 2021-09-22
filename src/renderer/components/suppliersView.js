import React from 'react'
import {Table, Divider, Popconfirm, Button, message, notification} from 'antd'
import {useDispatch} from 'react-redux'
import {
    setSupplierUpdatingId,
    deleteSupplier,
} from '../selectors/suppliersSlice'
import {NavLink} from 'react-router-dom'
import {setSelectedPage} from '../selectors/menuSlice'

import {getProductIdsAndOrderIdsBySupplierId} from '../api/db'

export function SuppliersView({suppliers}) {
    const dispatch = useDispatch()

    const onSupplierUpdate = (id) => {
        // log.debug('supplier updating id',id)
        dispatch(setSelectedPage('supplierUpdate'))
        dispatch(setSupplierUpdatingId(id))
    }

    const onDelete = async ({id, name}) => {
        const [productIds, orderIds] =
            await getProductIdsAndOrderIdsBySupplierId(id)
        let productsQty = productIds.length
        let ordersQty = orderIds.length
        if (productsQty || ordersQty) {
            notification.error({
                message: `供应商名下有订单或产品无法删除`,
                description: (
                    <div>
                        供应商 id-{id} {name} <br />
                        产品 {productsQty}
                        <br />
                        订单 {ordersQty}
                    </div>
                ),
                duration: 5,
                key: `deleteSupplier-${id}`,
            })
        } else {
            try {
                let result = await dispatch(
                    deleteSupplier({id, productIds, orderIds})
                ).unwrap()
                notification.success({
                    message: `供应商删除成功`,
                    description: (
                        <div>
                            id-{id} {name} <br />
                        </div>
                    ),
                    duration: 5,
                    key: `deleteSupplier-${id}`,
                })
            } catch (e) {
                notification.error({
                    message: `供应商删除失败`,
                    description: (
                        <div>
                            供应商 id-{id} {name} <br />
                            {e.message}
                        </div>
                    ),
                    duration: 5,
                    key: `deleteSupplier-${id}`,
                })
            }
        }
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: '公司名称',
            dataIndex: 'name',
        },
        {
            title: '地址',
            dataIndex: 'address',
        },
        {
            title: '联系人',
            dataIndex: 'contact',
        },
        {
            title: '电话',
            dataIndex: 'telephone',
        },
        {
            title: '手机',
            dataIndex: 'cellphone',
        },
        {
            title: '操作',
            key: '操作',
            width: '8em',
            render: (text, record) => {
                return (
                    <span>
                        <NavLink
                            to="/supplierUpdate"
                            onClick={() => {
                                onSupplierUpdate(record.id)
                            }}
                        >
                            编辑
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
    return <Table dataSource={suppliers} columns={columns} rowKey="id" />
}
