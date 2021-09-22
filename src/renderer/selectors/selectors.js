import { selectSupplierById, selectAllSuppliers, selectAllSupplierIds,selectAllSuppliersDict } from "./suppliersSlice"
import {createSelector } from '@reduxjs/toolkit'
import {selectAllOrders,selectOrderCreatingSupplierId,selectOrderDetailId,selectOrderInDetail} from "./ordersSlice"
import {selectAllProducts,selectProductNoFilter,selectSupplierNameFilter} from "./productsSlice"
import {selectAllOrderItems} from './orderItemsSlice'
export const selectOrderExcerpts = createSelector(
    selectAllOrders, selectAllSuppliers, selectAllSupplierIds,
    (orders, suppliers, supplierIds) => {
        return orders.map(order => {
            const index = supplierIds.indexOf(order.supplierId)
            const supplier = suppliers[index]
            return { ...order, supplierName: supplier.name }
        })

    }
)

export const selectProductExcerpts = createSelector(
    selectAllProducts,
    selectAllSuppliersDict,
    selectProductNoFilter,
    selectSupplierNameFilter,
    (products, suppliersDict, productNoFilter, supplierNameFilter) => {
        let reducer
        if (productNoFilter && supplierNameFilter) {
            reducer = (accumulator, product) => {
                if (product.productNo.indexOf(productNoFilter) >= 0) {
                    let supplierName = suppliersDict[product.supplierId].name
                    if (supplierName.indexOf(supplierNameFilter) >= 0) {
                        accumulator.push({ ...product, supplierName })
                    }
                }
                return accumulator
            }
        } else if (productNoFilter) {
            reducer = (accumulator, product) => {
                if (product.productNo.indexOf(productNoFilter) >= 0) {
                    let supplierName = suppliersDict[product.supplierId].name
                    accumulator.push({ ...product, supplierName })
                }
                return accumulator
            }
        } else if (supplierNameFilter) {
            reducer = (accumulator, product) => {

                let supplierName = suppliersDict[product.supplierId].name
                if (supplierName.indexOf(supplierNameFilter) >= 0) {
                    accumulator.push({ ...product, supplierName })
                }
                return accumulator
            }
        } else {
            reducer = (accumulator, product) => {

                let supplierName = suppliersDict[product.supplierId].name
                accumulator.push({ ...product, supplierName })
                return accumulator
            }
        }

        return products.reduce(reducer, [])
    })





