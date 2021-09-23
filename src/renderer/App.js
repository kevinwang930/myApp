import React, {useEffect} from 'react'
import {MemoryRouter, Route} from 'react-router-dom'
// import Route from 'react-router-cache-route'
import {Layout} from 'antd'

import {Orders} from './pages/orders'
import {Suppliers} from './pages/suppliers'
import {Database} from './pages/database'
import {SupplierUpdate} from './pages/supplierUpdate'
import {SupplierCreate} from './pages/supplierCreate'
import {SupplierAnalysis} from './pages/supplierAnalysis'
import {OrderCreate} from './pages/orderCreate'
import {OrderDetail} from './pages/orderDetail'
import {Products} from './pages/products'
import {ProductCreate} from './pages/productCreate'
import {ProductUpdate} from './pages/productUpdate'
import {Data} from './pages/data'
import {Test} from './pages/test'
import {NavBar} from './pages/navBar'

import {dbConnect, dbClose} from './api/db'
// import {  initStore } from './app/store'
import {log} from './api/log'
// import './App.global.css'

export default function App() {
    // useEffect(async ()=>{
    //     await dbConnect()
    //     await initStore()
    //     log.debug('fetch db data finished')
    //     return async ()=> {
    //         await dbClose()
    //         log.debug('db connect closed')
    //     }
    // },[])

    return (
        <MemoryRouter
            initialEntries={['/orders']}
            // initialIndex={1}
        >
            <Layout
            // className="h-full"
            >
                <NavBar />

                <main>
                    <Route exact path="/orders" component={Orders} />
                    <Route exact path="/orderCreate" component={OrderCreate} />
                    <Route exact path="/orderDetail" component={OrderDetail} />
                    <Route exact path="/suppliers" component={Suppliers} />
                    <Route exact path="/database" component={Database} />
                    <Route
                        exact
                        path="/supplierUpdate"
                        component={SupplierUpdate}
                    />
                    <Route
                        exact
                        path="/supplierCreate"
                        component={SupplierCreate}
                    />
                    <Route
                        exact
                        path="/SupplierAnalysis"
                        component={SupplierAnalysis}
                    />

                    <Route exact path="/products" component={Products} />
                    <Route
                        exact
                        path="/productCreate"
                        component={ProductCreate}
                    />
                    <Route
                        exact
                        path="/productUpdate"
                        component={ProductUpdate}
                    />

                    <Route exact path="/data" component={Data} />
                    <Route exact path="/test" component={Test} />
                </main>
            </Layout>
        </MemoryRouter>
    )
}
