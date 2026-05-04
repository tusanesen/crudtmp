import { Card, Descriptions, Space, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getOrderItemById } from '../../api/orderItemApi'

const { Text, Title } = Typography

export function OrderItemDetailView() {
  const { orderItemId } = useParams<{ orderItemId: string }>()
  const parsedOrderItemId = Number(orderItemId)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['orderItem', parsedOrderItemId],
    queryFn: () => getOrderItemById(parsedOrderItemId),
    enabled: Number.isInteger(parsedOrderItemId) && parsedOrderItemId > 0,
  })

  if (!orderItemId || !Number.isInteger(parsedOrderItemId) || parsedOrderItemId <= 0) {
    return <Text type="danger">Invalid order item id.</Text>
  }

  if (isError) {
    return <Text type="danger">Unable to load order item: {error.message}</Text>
  }

  return (
    <Space direction="vertical" size={16} className="entity-page">
      <Link to="/order-items">Back to Order Items</Link>
      <Card loading={isLoading}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>
            Order Item Details
          </Title>
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="ID">{data?.id}</Descriptions.Item>
            <Descriptions.Item label="Order ID">{data?.orderId}</Descriptions.Item>
            <Descriptions.Item label="Product ID">{data?.productId}</Descriptions.Item>
            <Descriptions.Item label="Quantity">{data?.quantity}</Descriptions.Item>
            <Descriptions.Item label="Unit Price">${data?.unitPrice?.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Line Total">
              {data ? `$${(data.quantity * data.unitPrice).toFixed(2)}` : ''}
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </Space>
  )
}
