import {
    createSlice,
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
} from '@reduxjs/toolkit'
import {
    getOrders,
    updateOrderById as updateOrderById_db,
    deleteOrderById as deleteOrderById_db,
    deleteOrderItemById as deleteOrderItemById_db,
} from '../api/db'
import {rendererLog} from '../log'

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async () => {
    const response = await getOrders()
    return response
})

export const updateOrder = createAsyncThunk(
    'orders/updateOrder',
    async ({id, changes}, thunkAPI) => {
        rendererLog.debug('changed values in slice', changes)
        const response = await updateOrderById_db(id, changes)

        return {id: id, changes: changes}
    }
)

export const deleteOrder = createAsyncThunk(
    'orders/deleteOrder',
    async ({id}, thunkAPI) => {
        try {
            await deleteOrderById_db(id)
            return id
        } catch (e) {
            Promise.reject(e)
        }
    }
)

export const ordersAdapter = createEntityAdapter()

const initialState = ordersAdapter.getInitialState({
    orderIdInDetailPage: null,
    id: 0,
})

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        setOrderIdInDetailPage(state, action) {
            // log.debug('action.payload', action.payload)
            state.orderIdInDetailPage = action.payload
        },

        UpdateOrderRedux(state, action) {
            ordersAdapter.updateOne(state, action.payload)
        },
        addOrderStoreId(state) {
            state.id = state.id + 1
        },
        insertOrderRedux(state, action) {
            ordersAdapter.addOne(state, action.payload)
        },
    },
    extraReducers: {
        [fetchOrders.fulfilled]: ordersAdapter.setAll,

        [updateOrder.fulfilled]: (state, action) => {
            ordersAdapter.updateOne(state, action.payload)
        },
        [deleteOrder.fulfilled]: (state, action) => {
            // log.debug('delete order payload ', action.payload)
            const id = action.payload
            ordersAdapter.removeOne(state, id)
        },
    },
})

export default ordersSlice.reducer
export const {
    selectAll: selectAllOrders,
    selectById: selectOrderById,
    selectIds: selectAllOrderIds,
    selectEntities: selectAllOrdersDict,
} = ordersAdapter.getSelectors((state) => state.orders)

export const selectOrderIdInDetailPage = (state) => {
    return state.orders.orderIdInDetailPage
}

export const selectOrderStoreId = (state) => {
    return state.orders.id
}

export const {
    setOrderIdInDetailPage,
    UpdateOrderRedux,
    setOrderUpdateId,
    insertOrderRedux,
} = ordersSlice.actions

export const selectOrdersBySupplierId = createSelector(
    selectAllOrders,
    (state, supplierId) => supplierId,
    (orders, supplierId) => {
        if (supplierId) {
            return orders.filter((order) => order.supplierId == supplierId)
        } else {
            return []
        }
    }
)

export const selectOrderByIdAllowNull = createSelector(
    (_, id) => id,
    selectAllOrdersDict,
    (id, Dict) => {
        if (id) {
            return Dict[id]
        } else {
            return null
        }
    }
)
