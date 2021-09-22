import { notification, Button } from 'antd'
import Excel from 'exceljs'
import { checkFileWritable } from '../../util'
import open from 'open'

export async function orderExcelReportAction({orderData,templatePath,orderCellPosition,orderSheetName,reportName,reportPath}) {

    try {
        await checkFileWritable(reportPath)
    } catch (e) {
        notification.error({
            message: e.message,
            key:orderData.orderNo
        })
        return 
    }
    let workbook = new Excel.Workbook()

    await workbook.xlsx.readFile(templatePath)
    workbook.creator = "kevin Wang"
    workbook.subject = "order"
    const orderSheet = workbook.getWorksheet(orderSheetName)
    writeSupplier(orderSheet, orderData.supplier,orderCellPosition)
    writeOrder(orderSheet, orderData,orderCellPosition)
    writeOrderItems(orderSheet, orderData.orderItems,orderCellPosition)
    await saveFile(workbook, orderData.orderNo,reportPath)

}

function writeSupplier(orderSheet, supplierInfo,orderCellPosition) {
    orderSheet.getCell(orderCellPosition.supplierName).value = supplierInfo.name
    orderSheet.getCell(orderCellPosition.supplierContact).value = supplierInfo.contact
    orderSheet.getCell(orderCellPosition.supplierPhone).value = supplierInfo.cellphone + "/" + supplierInfo.telephone

}

function writeOrder(orderSheet, orderData,orderCellPosition) {
    orderSheet.getCell(orderCellPosition.orderNo).value = orderData.orderNo
}

function writeOrderItems(orderSheet, orderItemsData,orderCellPosition) {
    let startCell = orderSheet.getCell(orderCellPosition.orderItemsRef)
    orderSheet.addTable({
        name: 'orderItemsTable',
        ref: orderCellPosition.orderItemsRef,
        headerRow: true,
        totalsRow: true,
        columns: [
            { name: '产品型号', filterButton: false },
            { name: '名称', filterButton: false },
            { name: '描述', filterButton: false },
            // { name: '详情', filterButton: false },
            { name: '价格', filterButton: false },
            { name: '数量', filterButton: false },
            { name: '金额', filterButton: false, totalsRowFunction: 'sum' }

        ],
        rows: orderItemsData.map((orderItemData, index) => {
            let priceAddress = orderSheet.getCell(startCell.row + index + 1, startCell.col + 3).address
            let quantityAddress = orderSheet.getCell(startCell.row + index + 1, startCell.col + 4).address
            return [orderItemData.productNo, orderItemData.productName, orderItemData.description, orderItemData.price, orderItemData.quantity, { formula: `product(${priceAddress},${quantityAddress})` }]
        })
    })
}

async function saveFile(workbook, orderNo,reportPath) {

    try {
        await workbook.xlsx.writeFile(reportPath)
        notification.success({
            message: '订单导出成功',
            description: `订单导出目录 ${reportPath}`,
            key: orderNo
        })
        open(reportPath, (err, stdout, stderr) => {
            if (err) {
                notification.error({
                    message: err,
                    key: orderNo
                })
                return
            }
        })
    } catch (e) {
        notification.error({
            message: e.code,
            description: e.message,
            duration: 0,
            key: orderNo,
        })
    }
}

export async function importOrder(filePath) {
    let workbook = new Excel.Workbook()

    await workbook.xlsx.readFile(filePath)
    let orderSheet = workbook.getWorksheet('order')
    console.log(orderSheet.getCell('G7').value)
    let table = orderSheet.getTable('orderItemsTable')
    console.log(table.ref)

}