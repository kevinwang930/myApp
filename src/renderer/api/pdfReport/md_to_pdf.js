import {mdToPdf} from 'md-to-pdf'
import mustache from 'mustache'
import { readFile } from 'fs/promises'
import { message } from 'antd'
import open from 'open'

export async function pdfgen_md2pdf(mdTemplatePath,reportPath,context) {

    try {
        let template = await readFile(mdTemplatePath)
        let templateString = template.toString()
        let mdString = await mustache.render(templateString, context)
        await mdToPdf({ content: mdString },{dest:reportPath})
        message.success({
            content: `pdf报告输出成功-${reportPath}`,
            key: "supplierReportError"
        })
        open(reportPath)
    } catch(e) {
        message.error({
            content: e.message,
            key: "supplierReportError"
        })
    }
    

}