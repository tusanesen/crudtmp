import { Button, Card, Form, InputNumber, Space, Typography } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  createOrderItem,
  updateOrderItem,
  type OrderItemPayload,
} from '../../api/orderItemApi'
import type { OrderItem } from '../../types/entities'

const { Text, Title } = Typography

type LocationState = {
  entity?: OrderItem
}

export function OrderItemEditView() {
  const [form] = Form.useForm<OrderItemPayload>()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { entity } = (location.state as LocationState | null) ?? {}
  const isUpdateMode = Boolean(entity)

  const mutation = useMutation({
    mutationFn: async (values: OrderItemPayload) => {
      if (entity) {
        return updateOrderItem(entity.id, values)
      }

      return createOrderItem(values)
    },
    onSuccess: async (savedEntity) => {
      await queryClient.invalidateQueries({ queryKey: ['orderItems'] })
      navigate(`/order-items/${savedEntity.id}`)
    },
  })

  const initialValues: OrderItemPayload | undefined = entity
    ? {
        orderId: entity.orderId,
        productId: entity.productId,
        quantity: entity.quantity,
        unitPrice: entity.unitPrice,
      }
    : undefined

  return (
    <Space direction="vertical" size={16} className="entity-page">
      <Link to="/order-items">Back to Order Items</Link>
      <Card>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>
            {isUpdateMode ? 'Edit Order Item' : 'Create Order Item'}
          </Title>
          <Text type="secondary">Mode: {isUpdateMode ? 'Update' : 'Create'}</Text>

          <Form<OrderItemPayload>
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={(values) => mutation.mutate(values)}
          >
            <Form.Item
              name="orderId"
              label="Order ID"
              rules={[{ required: true, message: 'Order ID is required' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="productId"
              label="Product ID"
              rules={[{ required: true, message: 'Product ID is required' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: 'Quantity is required' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="unitPrice"
              label="Unit Price"
              rules={[{ required: true, message: 'Unit price is required' }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>

            <Space>
              <Button type="primary" htmlType="submit" loading={mutation.isPending}>
                {isUpdateMode ? 'Save Changes' : 'Create'}
              </Button>
              <Button onClick={() => navigate('/order-items')}>Cancel</Button>
            </Space>
          </Form>

          {mutation.isError ? (
            <Text type="danger">Unable to save order item: {mutation.error.message}</Text>
          ) : null}
        </Space>
      </Card>
    </Space>
  )
}
