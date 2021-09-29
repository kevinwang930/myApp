import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {Menu} from 'antd'
import {
    ProfileOutlined,
    TeamOutlined,
    MenuOutlined,
    DatabaseOutlined,
    BugOutlined,
    SettingOutlined,
} from '@ant-design/icons'
import {NavLink} from 'react-router-dom'
import {setSelectedPage, getSelectedPage} from '../selectors/menuSlice'

function NavSubMenu({to, icon, children}) {
    return (
        <NavLink to={to} icon={icon} className="subMenu">
            {children}
        </NavLink>
    )
}
export function NavBar() {
    const dispatch = useDispatch()
    const selectedPage = useSelector(getSelectedPage)
    const onPageChange = ({key}) => {
        // log.debug('menu selected key change',key)
        dispatch(setSelectedPage(key))
    }
    return (
        <Menu
            theme="light"
            // onClick={this.handleClick}
            // defaultOpenKeys={['sub1', 'sub2', 'sub3', 'sub4']}
            // defaultSelectedKeys={['orders']}
            selectedKeys={selectedPage || 'orders'}
            onClick={onPageChange}
            mode="inline"
            className="menu noPrint"
        >
            <Menu.Item key="orders" icon={<ProfileOutlined />}>
                <NavLink to="/orders">订单</NavLink>
            </Menu.Item>
            <Menu.Item key="orderCreate">
                <NavLink to="/orderCreate" className="subMenu">
                    新增
                </NavLink>
            </Menu.Item>
            <Menu.Item key="orderDetail">
                <NavSubMenu to="/orderDetail">详情</NavSubMenu>
            </Menu.Item>

            <Menu.Item key="suppliers" icon={<TeamOutlined />}>
                <NavLink to="/suppliers">供应商</NavLink>
            </Menu.Item>
            <Menu.Item key="supplierCreate">
                <NavSubMenu to="/supplierCreate">新增</NavSubMenu>
            </Menu.Item>
            <Menu.Item key="supplierUpdate">
                <NavSubMenu to="/supplierUpdate">
                    <span>修改</span>
                </NavSubMenu>
            </Menu.Item>
            <Menu.Item key="supplierAnalysis">
                <NavSubMenu to="/supplierAnalysis">分析</NavSubMenu>
            </Menu.Item>
            <Menu.Item key="products" icon={<MenuOutlined />}>
                <NavLink to="/products">产品</NavLink>
            </Menu.Item>
            <Menu.Item key="productCreate">
                <NavSubMenu to="/productCreate">新增</NavSubMenu>
            </Menu.Item>
            {/* <Menu.Item key="productUpdate">
            <NavSubMenu to="/productUpdate">
                修改
            </NavSubMenu>
        </Menu.Item> */}
            {/* <Menu.Item key="data" icon={<ProfileOutlined />}>
                <NavLink to="/data">
                    <span>数据分析</span>
                </NavLink>
            </Menu.Item> */}
            <Menu.Item key="database" icon={<DatabaseOutlined />}>
                <NavLink to="/database">
                    <span>数据库</span>
                </NavLink>
            </Menu.Item>
            <Menu.Item key="setting" icon={<SettingOutlined />}>
                <NavLink to="/setting">
                    <span>设置</span>
                </NavLink>
            </Menu.Item>

            <Menu.Item key="test" icon={<BugOutlined />}>
                <NavLink to="/test">
                    <span>测试</span>
                </NavLink>
            </Menu.Item>
        </Menu>
    )
}
