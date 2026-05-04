import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout, Menu, Space, Typography } from 'antd'
import { ProductListView } from './features/products/ProductListView'
import { ProductDetailView } from './features/products/ProductDetailView'
import { CustomerListView } from './features/customers/CustomerListView'
import { CustomerDetailView } from './features/customers/CustomerDetailView'
import { OrderListView } from './features/orders/OrderListView'
import { OrderDetailView } from './features/orders/OrderDetailView'
import { OrderItemListView } from './features/orderItems/OrderItemListView'
import { OrderItemDetailView } from './features/orderItems/OrderItemDetailView'
import { OrderItemEditView } from './features/orderItems/OrderItemEditView'
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
    if (location.pathname.startsWith('/products')) {
      return '/products'
    }
    if (location.pathname.startsWith('/customers')) {
      return '/customers'
    }
    if (location.pathname.startsWith('/orders')) {
      return '/orders'
    }
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
            <Route path="/products/:productId" element={<ProductDetailView />} />
            <Route
              path="/customers"
              element={
                <EntityPage title="Customers" endpoint="customers">
                  <CustomerListView />
                </EntityPage>
              }
            />
            <Route path="/customers/:customerId" element={<CustomerDetailView />} />
            <Route
              path="/orders"
              element={
                <EntityPage title="Orders" endpoint="orders">
                  <OrderListView />
                </EntityPage>
              }
            />
            <Route path="/orders/:orderId" element={<OrderDetailView />} />
            <Route
              path="/order-items"
              element={
                <EntityPage title="Order Items" endpoint="orderItems">
                  <OrderItemListView />
                </EntityPage>
              }
            />
            <Route path="/order-items/edit" element={<OrderItemEditView />} />
            <Route path="/order-items/:orderItemId" element={<OrderItemDetailView />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
