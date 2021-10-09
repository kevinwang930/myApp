import {Button, Select, message, Divider, notification} from 'antd'
import {useSelector} from 'react-redux'
import React, {useState, useEffect} from 'react'
import {SupplierOrdersReport} from '../components/Report/supplierOrdersReport'
import {SupplierOrderItemsReport} from '../components/Report/supplierOrderItemsReport'
import {
    selectSupplierOptions,
    selectSupplierById,
} from '../selectors/suppliersSlice'
import {selectOrdersBySupplierId} from '../selectors/ordersSlice'
import {getSupplierOrderItemsSummary} from '../api/db'
import {printPdf} from '../../bridges/utils'

export function SupplierAnalysis() {
    const supplierOptions = useSelector(selectSupplierOptions)
    const [supplierId, setSupplierId] = useState(null)
    const supplier = useSelector((state) =>
        selectSupplierById(state, supplierId)
    )
    const orders = useSelector((state) =>
        selectOrdersBySupplierId(state, supplierId)
    )

    const [reportInfo, setReportInfo] = useState({})
    const changes = {
        supplier: false,
        orders: false,
    }
    useEffect(() => {
        changes.supplier = true
    }, [supplier])
    useEffect(() => {
        changes.orders = true
    }, [orders])
    useEffect(async () => {
        const newReportInfo = {...reportInfo}
        if (changes.supplier) {
            newReportInfo.supplier = supplier
        }
        if (changes.orders) {
            newReportInfo.orders = orders
            const ordersAnalysis = getOrdersAnalysis()
            newReportInfo.ordersAnalysis = ordersAnalysis
            try {
                newReportInfo.orderItemsAnalysis = await getOrderItemsAnalysis(
                    ordersAnalysis.totalAmount
                )
            } catch (e) {
                message.error({
                    content: e.message,
                    key: 'supplierReport',
                })
                return
            }
        }
        setReportInfo(newReportInfo)
    }, [supplier, orders])

    const getOrdersAnalysis = () => {
        if (orders.length) {
            const sortedOrder = [...orders].sort(
                (order1, order2) => order1.totalAmount < order2.totalAmount
            )
            const maxOrder = sortedOrder[sortedOrder.length - 1]
            const minOrder = sortedOrder[0]
            const totalAmount = orders.reduce(
                (accu, order) => accu + order.totalAmount,
                0
            )
            return {maxOrder, minOrder, totalAmount}
        }
        return {}
    }

    const getOrderItemsAnalysis = async (totalAmount) => {
        if (orders.length) {
            try {
                const orderItemsSummary = await getSupplierOrderItemsSummary(
                    supplierId
                )
                const maxOrderItem =
                    orderItemsSummary[orderItemsSummary.length - 1]
                const minOrderItem = orderItemsSummary[0]
                return {
                    orderItemsSummary,
                    totalAmount,
                    maxOrderItem,
                    minOrderItem,
                }
            } catch (e) {
                message.error({
                    content: e.message,
                    key: 'supplierReport',
                })
                return Promise.reject(e.message)
            }
        } else {
            return {}
        }
    }

    const onSupplierChange = (value) => {
        setSupplierId(value)
    }

    const pdfExport = async () => {
        if (!supplier) {
            message.error({
                content: '请选择供应商',
                key: 'supplierReport',
            })
        } else if (!orders.length) {
            message.error({
                content: `${supplier.name}名下无订单`,
                key: 'supplierReport',
            })
        } else {
            const exportName = `供应商报告-${supplier.name}.pdf`
            const feedback = await printPdf(exportName)
            if (feedback.result) {
                notification.success({
                    message: 'pdf 导出成功',
                    description: feedback.path,
                    key: 'pdfExport',
                })
            } else {
                notification.error({
                    message: 'pdf 导出失败',
                    description: feedback.message,
                    key: 'pdfExport',
                })
            }
        }
    }

    return (
        <div>
            <header className="noPrint">
                <Select
                    showSearch
                    defaultActiveFirstOption="false"
                    allowClear
                    options={supplierOptions}
                    dropdownMatchSelectWidth={false}
                    optionFilterProp="label"
                    placeholder="选择供应商"
                    onChange={onSupplierChange}
                />
                <Button onClick={pdfExport}>导出PDF</Button>
            </header>

            <SupplierReport reportInfo={reportInfo} />
        </div>
    )
}

const SupplierReport = ({reportInfo}) => {
    if (reportInfo.supplier) {
        return (
            <section className="reportContent">
                {reportInfo.orders.length ? (
                    <div>
                        <h1 className="text-center">
                            {reportInfo.supplier.name}订单情况
                        </h1>

                        <SupplierOrdersReport
                            supplier={reportInfo.supplier}
                            orders={reportInfo.orders}
                            ordersAnalysis={reportInfo.ordersAnalysis}
                        />
                        <Divider />

                        <SupplierOrderItemsReport
                            supplier={reportInfo.supplier}
                            orderItemsAnalysis={reportInfo.orderItemsAnalysis}
                        />
                    </div>
                ) : (
                    <div>{reportInfo.supplier.name} 有0个订单</div>
                )}
            </section>
        )
    }
    return (
        <section className="reportContent">
            <div />
        </section>
    )
}
