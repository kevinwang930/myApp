import {checkFileWritable} from '../utils'
import {message} from 'antd'
import path from 'path'

export let supplierPdfReport = {
    // this object used to convert markdown,tex to pdf
    reportDir: 'output',
    reportName: undefined,
    reportPath: undefined,
    texTemplatePath: 'public/template/supplierReport.tex',
    texPath: 'output/pdfReport/index.tex',
    mdTemplatePath: 'public/template/supplierReport.md',
    context: undefined,
    setReportInfo: undefined,
    report_latexmk: undefined,
    report_md2pdf: undefined,
}

supplierPdfReport.setReportInfo = function (reportName, context) {
    this.reportName = reportName
    this.context = context
    this.reportPath = path.join(this.reportDir, `${reportName}.pdf`)
}
supplierPdfReport.report_latexmk = async function () {
    let {pdfgen_latexmk} = await import('./pdfReport/latexmk')
    try {
        await checkFileWritable(this.reportPath)
    } catch (e) {
        message.error({
            content: `${this.reportPath}已经打开无法更新`,
            key: 'supplierReportError',
        })
        return
    }

    pdfgen_latexmk(
        this.texTemplatePath,
        this.texPath,
        this.reportPath,
        this.context
    )
}

supplierPdfReport.report_md2pdf = async function () {
    let {pdfgen_md2pdf} = await import('./pdfReport/md_to_pdf')
    try {
        await checkFileWritable(this.reportPath)
    } catch (e) {
        message.error({
            content: `${this.reportPath}已经打开无法更新`,
            key: 'supplierReportError',
        })
        return
    }

    pdfgen_md2pdf(this.mdTemplatePath, this.reportPath, this.context)
}
