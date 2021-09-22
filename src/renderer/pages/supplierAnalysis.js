import {Button, Col, Row, Select, message, Divider, Layout} from 'antd'
import {useSelector} from 'react-redux'
import React, {
    useState,
    useRef,
    useEffect,
    useImperativeHandle,
    forwardRef,
} from 'react'
import {SupplierOrdersReport} from '../components/Report/supplierOrdersReport'
import {SupplierOrderItemsReport} from '../components/Report/supplierOrderItemsReport'
import {
    selectSupplierOptions,
    selectSupplierByIdAllowNull,
} from '../selectors/suppliersSlice'
import {selectOrdersBySupplierId} from '../selectors/ordersSlice'
import {getSupplierOrderItemsSummary} from '../api/db'
import {pdfReport as pdfOutputReport} from '../api/supplierPdfReport'

const {Header, Content, Footer, Sider} = Layout

export function SupplierAnalysis() {
    const supplierOptions = useSelector(selectSupplierOptions)
    const [supplierId, setSupplierId] = useState(null)
    const supplier = useSelector((state) =>
        selectSupplierByIdAllowNull(state, supplierId)
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
            const ordersAnalysis = (newReportInfo.ordersAnalysis =
                getOrdersAnalysis())
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

    const onSupplierChange = (value, option) => {
        setSupplierId(value)
    }

    const pdfReport = async () => {
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
            const reportName = `供应商报告${supplier.name}`
            await pdfOutputReport.printPdf(reportName)
        }

        // let canvas = await html2canvas(reportElement)
        // var img = canvas.toDataURL("image/jpeg", 1);
        // var doc = new jsPDF('L', 'px');
        // doc.addImage(img, 'JPEG', 0, 0);
        // doc.save('output/sample-file.pdf');
    }

    const printReport = async () => {
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
            const reportName = `供应商报告${supplier.name}`
            await pdfOutputReport.print(reportName)
        }

        // let canvas = await html2canvas(reportElement)
        // var img = canvas.toDataURL("image/jpeg", 1);
        // var doc = new jsPDF('L', 'px');
        // doc.addImage(img, 'JPEG', 0, 0);
        // doc.save('output/sample-file.pdf');
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
                <Button onClick={pdfReport}>导出PDF</Button>
                <Button onClick={printReport}>打印</Button>
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
