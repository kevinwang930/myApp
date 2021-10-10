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
        title: 'A1',
    },
    orderItemsHeader: ['产品型号', '名称', '描述', '价格', '数量', '金额'],
    predefinedContents: {
        mergeCells: ['A1:F1'],
        cells: {
            A1: {
                value: '订单',

                style: {
                    alignment: {
                        horizontal: 'center',
                    },
                    font: {
                        size: 15,
                    },
                    fill: {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: {argb: 'ffCCE5FF'},
                    },
                    border: {
                        top: {style: 'thin'},
                        left: {style: 'thin'},
                        bottom: {style: 'thin'},
                        right: {style: 'thin'},
                    },
                },
            },
            A2: {
                value: '供应商',
            },
            A3: {
                value: '联系人',
            },
            A4: {
                value: '电话',
            },
            E2: {
                value: '订单编号',
            },
            E3: {
                value: '交付日期',
            },
            E4: {
                value: '付款方式',
            },
        },
    },
    sheetName: 'order',
    export_exceljs: undefined,
}

orderExportExcel.export_exceljs = async function export_exceljs(orderData) {
    const exportDir = getOutputPath()
    const templatePath = getTemplateExcelOrderPath()
    const exportName = `订单-${orderData.orderNo}`
    const exportPath = path.join(exportDir, `${exportName}.xlsx`)
    await orderExcelExportAction(
        this.sheetName,
        this.predefinedContents,
        this.orderCellPosition,
        this.orderItemsHeader,
        orderData,
        templatePath,

        exportName,
        exportPath
    )
}
