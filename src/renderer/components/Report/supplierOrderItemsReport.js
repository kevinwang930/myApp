


import { Column } from '@ant-design/charts'


export const SupplierOrderItemsReport = ({supplier,orderItemsAnalysis}) => { 
    let orderItemsSummary = orderItemsAnalysis.orderItemsSummary
    let maxOrderItem = orderItemsAnalysis.maxOrderItem
    let totalAmount = orderItemsAnalysis.totalAmount

    
    const config = {
        data: orderItemsSummary,
        // height: 400,
        xField: 'productLabel',
        yField: 'amount',
        xAxis: {
            title: {
                text: '产品型号',
                style: {
                    fontSize: 15
                }
            },
            label:{
                style:{
                    textAlign:'start',
                    
                },
                rotate: 20
            }
        },

        yAxis: {
            title: {
                text: '总金额',
                style: {
                    fontSize: 15
                }
            }
        },
        label: {
            position: 'top',
            formatter:({amount})=>{return amount.toLocaleString()}
        },
        maxColumnWidth: 50,
        tooltip: {
            fields: ['productNo', 'productName','amount'],
            showTitle: false,
            customItems: (originalItems) => {
                originalItems[2].value = originalItems[2].value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                return originalItems
            }
            // tooltip only one tooltip item with name and value
            // formatter:(data)=>{
            //     log.debug(data)
            //     return {name:data.orderNo,value:data.totalAmount}
            // }
            // title:"",
            // // follow:false,
            // position:'right',
            // shared:true
            // customContent:(title,items)=>{
            //     log.debug(items[0])
            //     let item = items[0]
            //     if (item) {
            //         return <Tooltip data={items[0].data}/>}
            //     else {
            //         return
            //     }

            // }
        },
        meta: {

            productNo: { alias: '产品型号' },
            amount: { alias: '总金额' },
            productName:{alias:'产品名称'}
        },
        padding: [20, 20, 95, 80]
    };
    return (
        <div className='chartReport' >
            <h2>
                订单产品概况
            </h2>
            <div className="chartView">
                
                    
                <Column {...config} className='chart'/>
                
                <div className='chartViewText'>
                    <ul className="chartViewTextUl">
                        <li>
                            {supplier.name}所有订单产品型号累计{orderItemsSummary.length}种
                        </li>
                        <li>
                            累计采购金额最高产品 {maxOrderItem.productLabel},金额 {maxOrderItem.amount.toLocaleString("zh-CN", { style: 'currency', currency: 'CNY' })},占比 {(maxOrderItem.amount / totalAmount * 100).toFixed(1) + '%'}
                        </li>
                    </ul>
                </div>
            </div>
            
        </div>)
}