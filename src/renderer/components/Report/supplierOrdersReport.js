
import { useRef,useState,forwardRef } from 'react'

import {Column} from '@ant-design/charts'



export const SupplierOrdersReport = ({supplier,orders,ordersAnalysis})=>{

    let totalAmount = ordersAnalysis.totalAmount.toLocaleString("zh-CN",{style:'currency',currency:'CNY'})
    let maxAmount = ordersAnalysis.maxOrder.totalAmount.toLocaleString("zh-CN",{style:'currency',currency:'CNY'})
    let minAmount = ordersAnalysis.minOrder.totalAmount.toLocaleString("zh-CN",{style:'currency',currency:'CNY'})
    let averageAmount = (ordersAnalysis.totalAmount/(orders.length)).toLocaleString("zh-CN",{style:'currency',currency:'CNY'})
    
    
    const config = {
        // autoFit:true,
        className:'chart',
        data: orders,
        // renderer:'svg',
        // height: 400,
        xField: 'orderNo',
        yField: 'totalAmount',
        xAxis: {
            title: {
                text: '订单编号',
                style: {
                    fontSize: 15
                }
            }
        },
        label:{
            position:'top',
            formatter:({totalAmount})=>{return totalAmount.toLocaleString()}
        },

        yAxis: {
            title: {
                text: '订单总金额',
                style: {
                    fontSize: 15
                }
            }
        },
        maxColumnWidth: 50,
        tooltip: {
            fields: ['orderNo', 'totalAmount'],
            showTitle: false,
            customItems:(originalItems)=>{
                originalItems[1].value =originalItems[1].value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                return originalItems
            }
        },
        meta: {

            orderNo: { alias: '订单编号' },
            totalAmount: { alias: '总金额' }
        },
        padding: [20, 20, 95, 80]
    };
    return (
        <div className='chartReport'>  
            <h2>
                订单概况
            </h2>
            <div className="chartView">
                
                <Column className='chart' {...config} />
                
                <div className='chartViewText'>
                    <ul className="chartViewTextUl">
                        <li>
                            {supplier.name}共有订单{orders.length}个， 总金额 {totalAmount}
                        </li>
                        <li>
                            订单最小金额 {minAmount}，最大金额 {maxAmount}，平均金额 {averageAmount}
                        </li>
                    </ul>
                </div>
            </div>
            
        </div>)
}