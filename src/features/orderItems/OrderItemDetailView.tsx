import { Button, Card, Descriptions, Popconfirm, Space, Tooltip, Typography, message } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteOrderItem, getOrderItemById } from '../../api/orderItemApi'

const { Text, Title } = Typography

export function OrderItemDetailView() {
  const { orderItemId } = useParams<{ orderItemId: string }>()
  const parsedOrderItemId = Number(orderItemId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['orderItem', parsedOrderItemId],
    queryFn: () => getOrderItemById(parsedOrderItemId),
    enabled: Number.isInteger(parsedOrderItemId) && parsedOrderItemId > 0,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => deleteOrderItem(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orderItems'] })
      message.success('Order item deleted')
      navigate('/order-items')
    },
    onError: (mutationError: Error) => {
      message.error(`Unable to delete order item: ${mutationError.message}`)
    },
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
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Tooltip title="Edit">
              <Button
                shape="circle"
                icon={<EditOutlined />}
                aria-label="Edit"
                onClick={() =>
                  navigate('/order-items/edit', {
                    state: {
                      entity: data,
                      returnTo: `/order-items/${parsedOrderItemId}`,
                    },
                  })
                }
                disabled={!data}
              />
            </Tooltip>
            <Popconfirm
              title="Delete this order item?"
              description="This action cannot be undone."
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
              onConfirm={() => {
                if (data) {
                  deleteMutation.mutate(data.id)
                }
              }}
              disabled={!data}
            >
              <Tooltip title="Delete">
                <Button
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  aria-label="Delete"
                  disabled={!data || deleteMutation.isPending}
                />
              </Tooltip>
            </Popconfirm>
          </Space>

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
