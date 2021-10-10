import {notification} from 'antd'
// import Excel from 'exceljs'
import {Workbook} from 'exceljs/excel'
import {checkFileWritable} from '../../utils'
import {openPath} from '../../../bridges/utils'

export async function orderExcelExportAction(
    sheetName,
    predefinedContents,
    orderCellPosition,
    orderItemsHeader,
    orderData,
    templatePath,

    exportName,
    exportPath
) {
    try {
        await checkFileWritable(exportPath)
    } catch (e) {
        notification.error({
            message: e.message,
            key: orderData.orderNo,
        })
        return
    }
    const workbook = new Workbook()

    // await workbook.xlsx.readFile(templatePath)
    workbook.creator = 'kevin Wang'
    workbook.subject = 'order'
    const orderSheet = workbook.addWorksheet(sheetName, {
        pageSetup: {
            paperSize: 9,
            orientation: 'portrait',
            margins: {
                left: 0.25,
                right: 0.25,
                top: 0.75,
                bottom: 0.75,
                header: 0.3,
                footer: 0.3,
            },
        },
        views: [
            {
                style: 'pageBreakPreview',
                showGridLines: false,
            },
        ],
        properties: {
            defaultColWidth: 15,
        },
    })
    sheetLoadPredefinedContents(orderSheet, predefinedContents)
    writeSupplier(orderSheet, orderData.supplier, orderCellPosition)
    writeOrder(orderSheet, orderData, orderCellPosition)
    writeOrderItems(
        orderSheet,
        orderItemsHeader,
        orderData.orderItems,
        orderCellPosition
    )
    await saveFile(workbook, orderData.orderNo, exportPath)
}

function sheetLoadPredefinedContents(sheet, predefinedContents) {
    // load cell contents
    if (predefinedContents.cells) {
        const {cells} = predefinedContents
        for (const [key, valueObject] of Object.entries(cells)) {
            const cell = sheet.getCell(key)
            for (const [propertyKey, property] of Object.entries(valueObject))
                cell[propertyKey] = property
        }
    }

    if (predefinedContents.mergeCells) {
        const {mergeCells} = predefinedContents
        for (const element of mergeCells) {
            sheet.mergeCells(element)
        }
    }
}

function writeSupplier(orderSheet, supplierInfo, orderCellPosition) {
    orderSheet.getCell(orderCellPosition.supplierName).value = supplierInfo.name
    orderSheet.getCell(orderCellPosition.supplierContact).value =
        supplierInfo.contact
    let phoneInfo
    if (supplierInfo.cellphone) {
        if (supplierInfo.telephone) {
            phoneInfo = `${supplierInfo.cellphone}/${supplierInfo.telephone}`
        } else {
            phoneInfo = supplierInfo.cellphone
        }
    } else {
        phoneInfo = supplierInfo.telephone
    }
    orderSheet.getCell(orderCellPosition.supplierPhone).value = phoneInfo
}

function writeOrder(orderSheet, orderData, orderCellPosition) {
    orderSheet.getCell(orderCellPosition.orderNo).value = orderData.orderNo
}

function writeOrderItems(
    orderSheet,
    orderItemsHeader,
    orderItemsData,
    orderCellPosition
) {
    const startCell = orderSheet.getCell(orderCellPosition.orderItemsRef)
    // write order Items header
    orderItemsHeader.forEach((headData, index) => {
        const cell = orderSheet.getCell(startCell.row, startCell.col + index)
        cell.value = headData
        cell.style = {
            alignment: {horizontal: 'center'},
            border: {
                top: {style: 'thin'},
                left: {style: 'thin'},
                bottom: {style: 'thin'},
                right: {style: 'thin'},
            },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: 'ffCCE5FF'},
            },
        }
    })

    // write each orderItems in a row
    orderItemsData.forEach((orderItemData, index) => {
        const productNoCell = orderSheet.getCell(
            startCell.row + index + 1,
            startCell.col
        )
        const productNameCell = orderSheet.getCell(
            startCell.row + index + 1,
            startCell.col + 1
        )
        const descriptionCell = orderSheet.getCell(
            startCell.row + index + 1,
            startCell.col + 2
        )

        const priceCell = orderSheet.getCell(
            startCell.row + index + 1,
            startCell.col + 3
        )
        const quantityCell = orderSheet.getCell(
            startCell.row + index + 1,
            startCell.col + 4
        )
        const amountCell = orderSheet.getCell(
            startCell.row + index + 1,
            startCell.col + 5
        )

        productNoCell.value = orderItemData.productNo
        productNameCell.value = orderItemData.productName
        descriptionCell.value = orderItemData.description
        priceCell.value = orderItemData.price
        quantityCell.value = orderItemData.quantity
        amountCell.value = {
            formula: `product(${priceCell.address},${quantityCell.address})`,
            result: orderItemData.price * orderItemData.quantity,
        }
    })
}

async function saveFile(workbook, orderNo, exportPath) {
    try {
        await workbook.xlsx.writeFile(exportPath)
        notification.success({
            message: '订单导出成功',
            description: `订单导出目录 ${exportPath}`,
            key: 'orderExport',
        })
        openPath(exportPath)
    } catch (e) {
        notification.error({
            message: e.code,
            description: e.message,
            duration: 0,
            key: 'orderExport',
        })
    }
}

// export async function importOrder(filePath) {
//     const workbook = new Excel.Workbook()

//     await workbook.xlsx.readFile(filePath)
//     const orderSheet = workbook.getWorksheet('order')
//     console.log(orderSheet.getCell('G7').value)
//     const table = orderSheet.getTable('orderItemsTable')
//     console.log(table.ref)
// }
