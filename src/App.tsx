import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout, Menu, Space, Typography } from 'antd'
import { ProductListView } from './features/products/components/ProductListView'
import { CustomerListView } from './features/customers/components/CustomerListView'
import { OrderListView } from './features/orders/components/OrderListView'
import { OrderItemListView } from './features/orderItems/components/OrderItemListView'
import './App.css'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

type EntityPageProps = {
  title: string
  endpoint: string
  children: ReactNode
}

function EntityPage({ title, endpoint, children }: EntityPageProps) {
  return (
    <Space direction="vertical" size={16} className="entity-page">
      <div>
        <Title level={3} className="page-title">
          {title}
        </Title>
        <Text type="secondary">Source: JSON Server (`{endpoint}`)</Text>
      </div>
      {children}
    </Space>
  )
}

const MENU_ITEMS = [
  { key: '/products', label: <Link to="/products">Products</Link> },
  { key: '/customers', label: <Link to="/customers">Customers</Link> },
  { key: '/orders', label: <Link to="/orders">Orders</Link> },
  { key: '/order-items', label: <Link to="/order-items">Order Items</Link> },
]

function App() {
  const location = useLocation()

  const selectedMenuKey = useMemo(() => {
    if (location.pathname.startsWith('/order-items')) {
      return '/order-items'
    }
    return location.pathname
  }, [location.pathname])

  return (
    <Layout className="app-layout">
      <Sider width={230} breakpoint="lg" collapsedWidth={0} className="app-sider">
        <div className="brand">Sales Admin</div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedMenuKey]} items={MENU_ITEMS} />
      </Sider>

      <Layout>
        <Header className="app-header">CRUD Console</Header>
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route
              path="/products"
              element={
                <EntityPage title="Products" endpoint="products">
                  <ProductListView />
                </EntityPage>
              }
            />
            <Route
              path="/customers"
              element={
                <EntityPage title="Customers" endpoint="customers">
                  <CustomerListView />
                </EntityPage>
              }
            />
            <Route
              path="/orders"
              element={
                <EntityPage title="Orders" endpoint="orders">
                  <OrderListView />
                </EntityPage>
              }
            />
            <Route
              path="/order-items"
              element={
                <EntityPage title="Order Items" endpoint="orderItems">
                  <OrderItemListView />
                </EntityPage>
              }
            />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
