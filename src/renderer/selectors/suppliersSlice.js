import {
    createSlice,
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
} from '@reduxjs/toolkit'
import {
    getSuppliers,
    insertSupplier as insertSupplier_db,
    updateSupplierById as updateSupplierById_db,
    deleteSupplierById as deleteSupplierById_db,
} from '../api/db'

export const fetchSuppliers = createAsyncThunk(
    'suppliers/fetchSuppliers',
    async () => {
        const response = await getSuppliers()
        return response
    }
)

export const createSupplier = createAsyncThunk(
    'suppliers/createSupplier',
    async (values) => {
        await insertSupplier_db(values)
        return values
    }
)

export const updateSupplier = createAsyncThunk(
    'suppliers/updateSupplier',
    async ({id, changes}) => {
        // log.debug('changed values in slice',changes)
        await updateSupplierById_db(id, changes)

        return {id, changes}
    }
)

export const deleteSupplier = createAsyncThunk(
    'suppliers/deleteSupplier',
    async ({id, productIds, orderIds}) => {
        try {
            await deleteSupplierById_db(id)
            return {id, productIds, orderIds}
        } catch (e) {
            Promise.reject(e)
        }
    }
)

const suppliersAdapter = createEntityAdapter()

const initialState = suppliersAdapter.getInitialState({
    supplierUpdating: null,
    supplierFilter: undefined,
})

const suppliersSlice = createSlice({
    name: 'suppliers',
    initialState,
    reducers: {
        setSupplierUpdatingId(state, action) {
            // log.debug('action.payload', action.payload)
            state.supplierUpdating = action.payload
        },
        setSupplierFilter(state, action) {
            state.supplierFilter = action.payload
        },
    },
    extraReducers: {
        [fetchSuppliers.fulfilled]: suppliersAdapter.setAll,
        [createSupplier.fulfilled]: (state, action) => {
            suppliersAdapter.addOne(state, action.payload)
        },
        [updateSupplier.fulfilled]: (state, action) => {
            suppliersAdapter.updateOne(state, action.payload)
        },
        [deleteSupplier.fulfilled]: (state, action) => {
            // log.debug('delete supplier payload ',action.payload)
            suppliersAdapter.removeOne(state, action.payload.id)
        },
    },
})

export const {
    selectAll: selectAllSuppliers,
    selectEntities: selectAllSuppliersDict,
    selectById: selectSupplierById,
    selectIds: selectAllSupplierIds,
} = suppliersAdapter.getSelectors((state) => state.suppliers)

export const selectSupplierUpdatingId = (state) => {
    return state.suppliers.supplierUpdating
}

export const selectSupplierFilter = (state) => {
    return state.suppliers.supplierFilter
}

export const {setSupplierUpdatingId, setSupplierFilter} = suppliersSlice.actions

export const selectSupplierOptions = createSelector(
    selectAllSuppliers,
    (suppliers) =>
        suppliers.map((supplier) => {
            return {
                label: supplier.name,
                value: supplier.id,
            }
        })
)

export const selectFilteredSuppliers = createSelector(
    selectSupplierFilter,
    selectAllSuppliers,
    (filterInfo, suppliers) => {
        if (filterInfo) {
            return suppliers.filter((supplier) =>
                supplier.name.includes(filterInfo)
            )
        }
        return suppliers
    }
)

export const selectSupplierByIdAllowNull = createSelector(
    selectAllSuppliersDict,
    (state, id) => id,
    (suppliers, id) => {
        if (!id) {
            return null
        }
        return suppliers[id]
    }
)

export default suppliersSlice.reducer
