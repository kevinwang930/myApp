import path from 'path'
import {orderExcelExportAction} from './excelExport/excelJs'
import {getOutputPath, getTemplateExcelOrderPath} from '../../bridges/settings'

export const orderExportExcel = {
    orderCellPosition: {
        orderNo: 'F2',
        supplierName: 'B2',
        supplierContact: 'B3',
        supplierPhone: 'B4',
        orderItemsRef: 'A6',
    },
    orderSheetName: 'order',
    export_exceljs: undefined,
}

orderExportExcel.export_exceljs = async function export_exceljs(orderData) {
    const exportDir = getOutputPath()
    const templatePath = getTemplateExcelOrderPath()
    const exportName = `订单_${orderData.orderNo}`
    const exportPath = path.join(exportDir, `${exportName}.xlsx`)
    await orderExcelExportAction(
        orderData,
        templatePath,
        this.orderCellPosition,
        this.orderSheetName,
        exportName,
        exportPath
    )
}
