import {configureStore} from '@reduxjs/toolkit'
import {combineReducers} from 'redux'
import supplierReducer, {fetchSuppliers} from '../selectors/suppliersSlice'
import menuReducer from '../selectors/menuSlice'
import orderReducer, {fetchOrders} from '../selectors/ordersSlice'
import productReducer, {fetchProducts} from '../selectors/productsSlice'
import orderItemReducer, {fetchOrderItems} from '../selectors/orderItemsSlice'
import {checkDataVersion} from '../api/db'
import {log} from '../log'

const combinedReducer = combineReducers({
    suppliers: supplierReducer,
    menu: menuReducer,
    orders: orderReducer,
    products: productReducer,
    orderItems: orderItemReducer,
})

const rootReducer = (state, action) => {
    if (action.type === 'clearStore') {
        // check for action type
        log.debug('store cleared')
        state = undefined
    }
    return combinedReducer(state, action)
}

export const store = configureStore({
    reducer: rootReducer,
})

export async function clearStoreAndFetchData() {
    store.dispatch({type: 'clearStore'})
    log.debug('fetch data to store')
    await store.dispatch(fetchSuppliers()).unwrap()
    await store.dispatch(fetchOrders()).unwrap()
    await store.dispatch(fetchProducts()).unwrap()
    await store.dispatch(fetchOrderItems()).unwrap()
}
