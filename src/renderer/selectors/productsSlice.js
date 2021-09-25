import {
    createSlice,
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
} from '@reduxjs/toolkit'
import {
    getProducts,
    insertProduct as insertProduct_db,
    insertProducts as insertProducts_db,
    updateProductById as updateProductById_db,
    deleteProductById as deleteProductById_db,
} from '../api/db'
import {log} from '../log'

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async () => {
        const response = await getProducts()
        return response
    }
)

export const createProduct = createAsyncThunk(
    'products/createProduct',
    async (values) => {
        await insertProduct_db(values)

        return values
    }
)

export const createProducts = createAsyncThunk(
    'products/createProducts',
    async (productsArray) => {
        await insertProducts_db(productsArray)
        return productsArray
    }
)

export const updateProduct = createAsyncThunk(
    'products/updateProduct',
    async ({id, changes}, thunkAPI) => {
        log.debug('changed values in slice', changes)
        const response = await updateProductById_db(id, changes)

        return {id: id, changes: changes}
    }
)

export const deleteProduct = createAsyncThunk(
    'products/deleteProduct',
    async ({id}, thunkAPI) => {
        await deleteProductById_db(id)
        return {id: id}
    }
)

export const productsAdapter = createEntityAdapter()

const initialState = productsAdapter.getInitialState({
    productsUpdating: {},
    productNoFilter: null,
    supplierNameFilter: null,
})

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearProductsUpdating(state) {
            // log.debug('action.payload', action.payload)
            state.productsUpdating = {}
        },
        addOneProductsUpdating(state, action) {
            const productWaitUpdating = action.payload
            if (productWaitUpdating.id in state.productsUpdating === false) {
                state.productsUpdating[productWaitUpdating.id] =
                    productWaitUpdating
            }
        },
        setProductNoFilter(state, action) {
            // log.debug('action.payload', action.payload)
            state.productNoFilter = action.payload
        },
        setSupplierNameFilter(state, action) {
            // log.debug('action.payload', action.payload)
            state.supplierNameFilter = action.payload
        },
    },
    extraReducers: {
        [fetchProducts.fulfilled]: productsAdapter.setAll,
        [createProduct.fulfilled]: (state, action) => {
            productsAdapter.addOne(state, action.payload)
        },
        [updateProduct.fulfilled]: (state, action) => {
            productsAdapter.updateOne(state, action.payload)
        },
        [deleteProduct.fulfilled]: (state, action) => {
            // log.debug('delete product payload ',action.payload)
            productsAdapter.removeOne(state, action.payload.id)
        },
        [createProducts.fulfilled]: (state, action) => {
            productsAdapter.addMany(state, action.payload)
        },
    },
})

export default productsSlice.reducer
export const {
    selectAll: selectAllProducts,
    selectById: selectProductById,
    selectIds: selectAllProductIds,
} = productsAdapter.getSelectors((state) => state.products)

export const selectProductUpdatingId = (state) => {
    return state.products.productUpdating
}
export const selectProductNoFilter = (state) => {
    return state.products.productNoFilter
}
export const selectSupplierNameFilter = (state) => {
    return state.products.supplierNameFilter
}

export const selectProductsBySupplierId = (state, supplierId) => {
    if (supplierId) {
        return state.products.filter(
            (product) => product.supplierId === supplierId
        )
    } else return []
}

export const selectProductOptionsBySupplierId = createSelector(
    selectAllProducts,
    (state, supplierId) => supplierId,
    (products, supplierId) => {
        if (supplierId) {
            let reducer = (accumulator, currentProduct) => {
                if (currentProduct.supplierId === supplierId) {
                    accumulator.push({
                        label: `${currentProduct.productNo}-${currentProduct.name}`,
                        value: currentProduct.id,
                    })
                }
                return accumulator
            }

            return products.reduce(reducer, [])
        } else return null
    }
)

export const {
    clearProductsUpdating,
    addOneProductsUpdating,
    setProductNoFilter,
    setSupplierNameFilter,
} = productsSlice.actions

export const selectProductUpdating = createSelector(
    [selectAllProducts, selectProductUpdatingId],
    (products, productId) => {
        if (productId) {
            return products.find((product) => product.id === productId)
        }
    }
)

export const selectProductsAndOptionsBySupplierId = createSelector(
    (state, id) => id,
    selectAllProducts,
    (supplierId, products) => {
        if (supplierId) {
            const reducer = (accumulator, product) => {
                if (product.supplierId === supplierId) {
                    const option = {
                        label: product.productNo + '-' + product.name,
                        value: product.id,
                    }
                    accumulator.productOptions.push(option)
                    accumulator.products[product.id] = product
                }
                return accumulator
            }
            return products.reduce(reducer, {products: {}, productOptions: []})
        } else return {products: {}, productOptions: []}
    }
)
