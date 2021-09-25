import {createSlice} from '@reduxjs/toolkit'

const initialState = {selectedPage: null}

const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        setSelectedPage(state, action) {
            // log.debug(state.selectedPage)
            // log.debug(action.payload)
            if (state.selectedPage !== action.payload) {
                state.selectedPage = action.payload
            }
        },
    },
})

export default menuSlice.reducer
export const {setSelectedPage} = menuSlice.actions
export const getSelectedPage = (state) => state.menu.selectedPage
