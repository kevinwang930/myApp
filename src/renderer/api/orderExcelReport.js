import path from 'path'


import {orderExcelReportAction as report_exceljs} from './excelReport/excelJs'

export let orderExcelReport = {
    reportDir: 'output',
    templatePath: 'public/template/orderReport.xlsx',
    orderCellPosition:{
        orderNo: "F2",
        supplierName: 'B2',
        supplierContact: 'B3',
        supplierPhone: 'B4',
        orderItemsRef: 'A6'
    },
    orderSheetName:'order',
    report_exceljs:undefined,

}


orderExcelReport.report_exceljs = async function (orderData)  {

    let reportName = '订单_' + orderData.orderNo
    let reportPath = path.join(this.reportDir,`${reportName}.xlsx`)
    await report_exceljs({
        orderData:orderData,
        templatePath:this.templatePath,
        orderCellPosition:this.orderCellPosition,
        orderSheetName:this.orderSheetName,
        reportName,
        reportPath
    })
}