
import { access,open,mkdir,writeFile} from 'fs/promises'
import { constants,existsSync,mkdirSync} from 'fs';
import { message } from 'antd'
import path from 'path'
import {printPdf_electron,print_electron} from './pdfReport/electron'
import { checkFileWritable } from '../util';



const saveChart = async function (chartInstance,chartDir,name) {
    try {
        await access(chartDir, constants.F_OK)
    } catch (e) {
        await mkdir(chartDir, { recursive: true })
    }

    let dataURL = chartInstance.toDataURL()
    // log.info(dataURL)
    let base64Data = dataURL.slice(22)
    // log.info(base64Data)
    // let base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
    const buff = Buffer.from(base64Data, 'base64')
    await writeFile(path.join(chartDir, name+'.png'), buff)
}


export let pdfReport = {
    reportDir: 'output',
    
    reportName: undefined,
    reportPath: undefined,
    print:undefined,
    printPdf:undefined
}


pdfReport.print = async function(reportName) {
    this.reportPath = path.join(this.reportDir, `${reportName}.pdf`)
    await print_electron(this.reportPath)
}


pdfReport.printPdf =  async function (reportName) {
    // await new Promise(resolve => setTimeout(resolve, 5000))
    this.reportPath = path.join(this.reportDir, `${reportName}.pdf`)
    await printPdf_electron(this.reportPath)
    
}

