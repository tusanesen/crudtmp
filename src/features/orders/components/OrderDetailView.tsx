import { Card, Descriptions, Space, Tag, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getOrderById } from '../../../api/orderApi'
import { OrderStatus } from '../../../types/enums'

const { Text, Title } = Typography

export function OrderDetailView() {
  const { orderId } = useParams<{ orderId: string }>()
  const parsedOrderId = Number(orderId)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['order', parsedOrderId],
    queryFn: () => getOrderById(parsedOrderId),
    enabled: Number.isInteger(parsedOrderId) && parsedOrderId > 0,
  })

  if (!orderId || !Number.isInteger(parsedOrderId) || parsedOrderId <= 0) {
    return <Text type="danger">Invalid order id.</Text>
  }

  if (isError) {
    return <Text type="danger">Unable to load order: {error.message}</Text>
  }

  return (
    <Space direction="vertical" size={16} className="entity-page">
      <Link to="/orders">Back to Orders</Link>
      <Card loading={isLoading}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>
            Order Details
          </Title>
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="ID">{data?.id}</Descriptions.Item>
            <Descriptions.Item label="Order #">{data?.orderNumber}</Descriptions.Item>
            <Descriptions.Item label="Customer ID">{data?.customerId}</Descriptions.Item>
            <Descriptions.Item label="Order Date">{data?.orderDate}</Descriptions.Item>
            <Descriptions.Item label="Status">
              {data ? (
                <Tag color={data.status === OrderStatus.Delivered ? 'green' : 'blue'}>{data.status}</Tag>
              ) : null}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">${data?.totalAmount?.toFixed(2)}</Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </Space>
  )
}
