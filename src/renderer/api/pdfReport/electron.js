import { ipcRenderer } from "electron";
import {message} from 'antd'
import open from 'open'



export async function printPdf_electron(outputPath) {

    
    try {
        // let currentWebContents = remote.getCurrentWebContents()
        // let data = await currentWebContents.printToPDF({
        //     landscape:false
        // })
        // await writeFile(outputPath, data)
        let feedback = await ipcRenderer.invoke('printPdf',outputPath)
        if (feedback.result) {
            message.success({
                content: `pdf成功导出`,
                key: 'supplierReport'
            })
            open(outputPath)
        } else {
            message.error({
                content: feedback.message,
                key: 'supplierReport'
            })
        }
    } catch (e) {
        message.error({
            content: e.message,
            key: 'supplierReport'
        })
    }
    // for (const element of chartNodes) {
    //     element.style.width = normalWidth
    // }
    
    
    
}

export async function print_electron(outputPath) {

    try {
        // let currentWebContents = remote.getCurrentWebContents()
        // let data = await currentWebContents.printToPDF({
        //     landscape:false
        // })
        // await writeFile(outputPath, data)
        let feedback = await ipcRenderer.invoke('print', outputPath)
        if (feedback.result) {
            message.success({
                content: `pdf成功导出`,
                key: 'supplierReport'
            })
            open(outputPath)
        } else {
            message.error({
                content: feedback.message,
                key: 'supplierReport'
            })
        }

    } catch (e) {
        message.error({
            content: e.message,
            key: 'supplierReport'
        })
    }


}