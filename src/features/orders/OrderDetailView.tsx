import { Button, Card, Descriptions, Modal, Popconfirm, Space, Tabs, Tag, Tooltip, Typography, message } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteOrder, getOrderById } from '../../api/orderApi'
import { OrderItemDetailView } from '../orderItems/OrderItemDetailView'
import { OrderItemEditView } from '../orderItems/OrderItemEditView'
import { OrderItemListView } from '../orderItems/OrderItemListView'
import type { OrderItem } from '../../types/entities'
import { OrderStatus } from '../../types/enums'

const { Text, Title } = Typography

export function OrderDetailView() {
  const { orderId } = useParams<{ orderId: string }>()
  const parsedOrderId = Number(orderId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTabKey, setActiveTabKey] = useState('orderItems')
  const [detailItemId, setDetailItemId] = useState<number | null>(null)
  const [editingOrderItem, setEditingOrderItem] = useState<OrderItem | null>(null)
  const [isCreateOrderItemOpen, setIsCreateOrderItemOpen] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['order', parsedOrderId],
    queryFn: () => getOrderById(parsedOrderId),
    enabled: Number.isInteger(parsedOrderId) && parsedOrderId > 0,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => deleteOrder(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
      message.success('Order deleted')
      navigate('/orders')
    },
    onError: (mutationError: Error) => {
      message.error(`Unable to delete order: ${mutationError.message}`)
    },
  })

  if (!orderId || !Number.isInteger(parsedOrderId) || parsedOrderId <= 0) {
    return <Text type="danger">Invalid order id.</Text>
  }

  if (isError) {
    return <Text type="danger">Unable to load order: {error.message}</Text>
  }

  const tabItems = [
    {
      key: 'orderItems',
      tab: 'Order Items',
      children: (
        <OrderItemListView
          mode="detailCtx"
          parentOrderId={parsedOrderId}
          onOpenDetail={(orderItemId) => setDetailItemId(orderItemId)}
          onOpenEdit={(entity) => setEditingOrderItem(entity)}
          onOpenCreate={() => setIsCreateOrderItemOpen(true)}
        />
      ),
    },
  ]

  const isEditOrderItemOpen = Boolean(editingOrderItem)
  const isDetailOrderItemOpen = detailItemId !== null

  return (
    <Space direction="vertical" size={16} className="entity-page">
      <Link to="/orders">Back to Orders</Link>
      <Card loading={isLoading}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Tooltip title="Edit">
              <Button
                shape="circle"
                icon={<EditOutlined />}
                aria-label="Edit"
                onClick={() =>
                  navigate('/orders/edit', {
                    state: {
                      entity: data,
                      returnTo: `/orders/${parsedOrderId}`,
                    },
                  })
                }
                disabled={!data}
              />
            </Tooltip>
            <Popconfirm
              title="Delete this order?"
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
            Order Details
          </Title>
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="ID">{data?.id}</Descriptions.Item>
            <Descriptions.Item label="Order #">{data?.orderNumber}</Descriptions.Item>
            <Descriptions.Item label="Customer">{data?.customerDisplay}</Descriptions.Item>
            <Descriptions.Item label="Order Date">{data?.orderDate}</Descriptions.Item>
            <Descriptions.Item label="Status">
              {data ? (
                <Tag color={data.status === OrderStatus.Delivered ? 'green' : 'blue'}>{data.status}</Tag>
              ) : null}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">${data?.totalAmount?.toFixed(2)}</Descriptions.Item>
          </Descriptions>

          <Tabs activeKey={activeTabKey} onChange={setActiveTabKey} items={tabItems} />
        </Space>
      </Card>

      <Modal
        title="Order Item Details"
        open={isDetailOrderItemOpen}
        onCancel={() => setDetailItemId(null)}
        footer={null}
        destroyOnClose
        width={900}
      >
        {detailItemId ? (
          <OrderItemDetailView
            mode="detailCtx"
            orderItemId={detailItemId}
            onOpenEdit={(entity) => {
              setDetailItemId(null)
              setEditingOrderItem(entity)
            }}
            onClose={() => setDetailItemId(null)}
          />
        ) : null}
      </Modal>

      <Modal
        title={isCreateOrderItemOpen ? 'Create Order Item' : 'Edit Order Item'}
        open={isCreateOrderItemOpen || isEditOrderItemOpen}
        onCancel={() => {
          setIsCreateOrderItemOpen(false)
          setEditingOrderItem(null)
        }}
        footer={null}
        destroyOnClose
        width={900}
      >
        <OrderItemEditView
          mode="detailCtx"
          parentOrderId={parsedOrderId}
          entity={editingOrderItem ?? undefined}
          onSaved={() => {
            setIsCreateOrderItemOpen(false)
            setEditingOrderItem(null)
          }}
          onClose={() => {
            setIsCreateOrderItemOpen(false)
            setEditingOrderItem(null)
          }}
        />
      </Modal>
    </Space>
  )
}
