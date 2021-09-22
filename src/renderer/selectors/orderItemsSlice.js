import { createSlice, createAsyncThunk, createEntityAdapter, createSelector} from '@reduxjs/toolkit'
import {getOrderItems as getOrderItemsDB,deleteOrderItemById as deleteOrderItemById_db,updateOrderItemById,insertOrderItem as insertOrderItem_db} from '../api/db'

export const fetchOrderItems = createAsyncThunk('orderItems/fetchOrderItems', async () => {

    const response = await getOrderItemsDB()
    return response
})

export const deleteOrderItem = createAsyncThunk('orderItems/deleteOrderItem',
    async (id)=> {
        await deleteOrderItemById_db(id)
        return id
    }
)

export const updateOrderItem = createAsyncThunk('orderItems/updateOrderItem',
    async ({id,changes}) => {
        await updateOrderItemById(id,changes)
        return { id, changes}
    }
)

export const createOrderItem = createAsyncThunk('orderItems/createOrderItem',
    async (info) => {
        await insertOrderItem_db(info)
        return info
    }
)

export const orderItemsAdapter = createEntityAdapter()

const initialState = orderItemsAdapter.getInitialState({id:0})

const orderItemsSlice = createSlice({
    name:"orderItems",
    initialState,
    reducers:{
        InsertOrderItemsRedux(state,action) {
            orderItemsAdapter.addMany(state,action.payload)
            state.id = state.id+1
        },
        removeOrderItems(state,action) {
            orderItemsAdapter.removeMany(state,action.payload)
            state.id = state.id + 1
        }
    },
    extraReducers: {
        [fetchOrderItems.fulfilled]: orderItemsAdapter.setAll,
        [deleteOrderItem.fulfilled]:(state,action)=> {
            orderItemsAdapter.removeOne(state,action.payload)
            state.id = state.id + 1
        },
        [updateOrderItem.fulfilled]:(state,action)=>{
            orderItemsAdapter.updateOne(state,action.payload)
            state.id = state.id + 1
        },
        [createOrderItem.fulfilled]:(state,action)=>{
            orderItemsAdapter.addOne(state,action.payload)
            state.id = state.id + 1
        }
    }
})

export default orderItemsSlice.reducer
export const {
    selectAll: selectAllOrderItems,
    selectEntities:selectAllOrderitemsDict,
    selectById: selectOrderItemById,
    selectIds: selectAllOrderItemIds
} = orderItemsAdapter.getSelectors(state => state.orderItems)

export const {InsertOrderItemsRedux,removeOrderItems} = orderItemsSlice.actions

export const selectOrderItemStoreId = (state)=>state.orderItems.id

export const selectOrderItemsByIds = createSelector(
    (state,ids)=>ids,
    selectAllOrderitemsDict,
    (ids,orderItemsDict)=> {
        if (ids && ids.length) {
            let selectedOrderItems = []
            ids.forEach(id=>selectedOrderItems.push(orderItemsDict[id]))
            return selectedOrderItems

        } else {
            return []
        }
    }
)

