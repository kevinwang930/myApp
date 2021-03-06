
import { writeFile } from "fs/promises";
import { parse } from 'node-html-parser';
import { execFile } from "child_process";
import opn from 'open'
export async function pdfgen_prince(node,reportPath) {

    let pdfHTML = parse(node.outerHTML)
    
    // let canvasList = pdfHTML.querySelectorAll('canvas')
    // for (node of canvasList) {
    //     node.remove()
    // }
    // let svgList = pdfHTML.querySelectorAll('svg')
    // for (node of svgList) {
    //     node.remove()
    // }
    
    pdfHTML.insertAdjacentHTML('afterbegin', '<p>test</p>')
    await writeFile('output/node.html',pdfHTML.outerHTML)
    execFile(`prince`,[
        '--style=dist/index.css', 
        `--style=node_modules/antd/dist/antd.css`,
        'output/node.html',
        `--output=${reportPath}`      
    ], (error, stdout, stderr) => {
        if (error) {
            throw error;
        }
        opn(reportPath)
        console.log(stdout);
    })
    // const doc = new jsPDF();

    // await doc.html(pdfHTML.outerHTML)
    // await doc.save("output/a4.pdf");
    
}