import {NavLink} from 'react-router-dom'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Row, Col, Button, Input} from 'antd'
import {SuppliersView} from '../components/suppliersView'
import {setSelectedPage} from '../selectors/menuSlice'
import {
    setSupplierFilter,
    selectFilteredSuppliers,
} from '../selectors/suppliersSlice'

const {Search} = Input
export const Suppliers = () => {
    const dispatch = useDispatch()
    const suppliers = useSelector(selectFilteredSuppliers)

    const onSupplierCreate = () => {
        // log.debug('supplier updating id',id)
        dispatch(setSelectedPage('supplierCreate'))
    }

    const onSupplierSearch = (value, event) => {
        dispatch(setSupplierFilter(value))
    }

    return (
        <div>
            <Row style={{marginBottom: 16}}>
                <Col>
                    <NavLink to="/supplierCreate" onClick={onSupplierCreate}>
                        <Button>新增</Button>
                    </NavLink>
                </Col>
                <Col>
                    <Search
                        placeholder="搜索供应商名称"
                        onSearch={onSupplierSearch}
                        allowClear
                    />
                </Col>
            </Row>
            <SuppliersView suppliers={suppliers} />
        </div>
    )
}
