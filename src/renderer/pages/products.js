import React from 'react'
import {NavLink} from 'react-router-dom'
import {Button, Row, Col, Form, Input} from 'antd'
import {useSelector, useDispatch} from 'react-redux'
import {
    setProductNoFilter,
    setSupplierNameFilter,
} from '../selectors/productsSlice'
import {selectProductExcerpts} from '../selectors/selectors'

import {setSelectedPage} from '../selectors/menuSlice'
import {rendererLog} from '../log'

import {ProductsView} from '../components/productsView'

const FormItem = Form.Item
const {Search} = Input

export const Products = () => {
    const dispatch = useDispatch()

    const productExcerpts = useSelector(selectProductExcerpts)

    const onProductSearch = (value) => {
        rendererLog.debug('product search value ', value)
        dispatch(setProductNoFilter(value.trim()))
    }
    const onSupplierSearch = (value) => {
        dispatch(setSupplierNameFilter(value.trim()))
    }

    const onProductCreate = () => {
        dispatch(setSelectedPage('productCreate'))
    }

    return (
        <div>
            <Row style={{marginBottom: 16}}>
                <Col>
                    <NavLink to="/productCreate" onClick={onProductCreate}>
                        <Button>新增</Button>
                    </NavLink>
                </Col>
                <Col>
                    <Form layout="inline" style={{textAlign: 'right'}}>
                        <FormItem>
                            <Search
                                placeholder="搜索产品编号"
                                onSearch={onProductSearch}
                                allowClear
                            />
                        </FormItem>
                        <FormItem>
                            <Search
                                placeholder="搜索供应商名称"
                                onSearch={onSupplierSearch}
                                allowClear
                            />
                        </FormItem>
                    </Form>
                </Col>
            </Row>
            <ProductsView products={productExcerpts} />
        </div>
    )
}
