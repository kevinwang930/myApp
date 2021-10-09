import {execFile} from 'child_process'
import opn from 'open'
import {readFile, writeFile, rename} from 'fs/promises'
import mustache from 'mustache'
import {message} from 'antd'

/*
tex command:
latexmk exec:`latexmk -aux-directory=output/pdfReport/auxilary -outdir=output -pdf -quiet -rc-report- -rules-  ${texPath}`
latexmk execFile: 'latexmk', ['-aux-directory=output/pdfReport/auxilary', '-outdir=output', '-pdf', '-quiet', '-rc-report-', '-rules-', texPath]
pdflatex exec : `pdflatex -aux-directory=output/pdfReport/auxilary -output-directory=output -job-name=${reportName} ${texPath}`

*/

async function texgen_async(templatePath, texPath, context) {
    const template = await readFile(templatePath)
    const templateString = template.toString()
    const texData = await mustache.render(templateString, context)
    await writeFile(texPath, texData)
}

export async function pdfgen_latexmk(
    templatePath,
    texPath,
    reportPath,
    context
) {
    try {
        await texgen_async(templatePath, texPath, context)
    } catch (e) {
        message.error({
            content: e.message,
            key: 'supplierReportError',
        })
        return
    }

    execFile(
        'latexmk',
        [
            '-aux-directory=output/pdfReport/auxilary',
            '-outdir=output',
            '-pdf',
            '-quiet',
            '-rc-report-',
            '-rules-',
            texPath,
        ],
        async (err, stdout, stderr) => {
            if (err) {
                message.error({
                    content: err.message,
                    key: 'supplierReportError',
                })
            } else {
                try {
                    await rename('output/index.pdf', reportPath)
                    await opn(reportPath)
                    message.success({
                        content: `pdf报告输出成功-${reportPath}`,
                        key: 'supplierReport',
                    })
                } catch (e) {
                    message.error({
                        content: e.message,
                        key: 'supplierReportError',
                    })
                }
            }
        }
    )
}
