import { Button, Card, Form, InputNumber, Select, Space, Typography } from 'antd'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  createOrderItem,
  updateOrderItem,
  type OrderItemPayload,
} from '../../api/orderItemApi'
import { entityRelations } from '../../config/entityConfigs'
import type { OrderItem } from '../../types/entities'

const { Text, Title } = Typography

type LocationState = {
  entity?: OrderItem
  returnTo?: string
}

export function OrderItemEditView() {
  const [form] = Form.useForm<OrderItemPayload>()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { entity, returnTo } = (location.state as LocationState | null) ?? {}
  const fallbackReturnPath = entity ? `/order-items/${entity.id}` : '/order-items'
  const nextPath = returnTo ?? fallbackReturnPath
  const isUpdateMode = Boolean(entity)
  const relationQueries = useQueries({
    queries: entityRelations.orderItem.map((relation) => ({
      queryKey: [relation.queryKey],
      queryFn: relation.fetchAll,
    })),
  })

  const orderRelation = entityRelations.orderItem.find((relation) => relation.field === 'orderId')
  const productRelation = entityRelations.orderItem.find((relation) => relation.field === 'productId')
  const orders = relationQueries[0]?.data as Array<{ id: number }> | undefined
  const products = relationQueries[1]?.data as Array<{ id: number }> | undefined
  const isOrdersLoading = relationQueries[0]?.isLoading ?? false
  const isProductsLoading = relationQueries[1]?.isLoading ?? false

  const mutation = useMutation({
    mutationFn: async (values: OrderItemPayload) => {
      if (entity) {
        return updateOrderItem(entity.id, values)
      }

      return createOrderItem(values)
    },
    onSuccess: async (savedEntity) => {
      await queryClient.invalidateQueries({ queryKey: ['orderItems'] })
      if (returnTo) {
        navigate(returnTo)
        return
      }

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
      <Link to={nextPath}>Back</Link>
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
              <Form.Item name="orderId" label="Order" rules={[{ required: true, message: 'Order is required' }]}>
                <Select
                showSearch
                optionFilterProp="label"
                loading={isOrdersLoading}
                placeholder="Select order"
                  options={(orders ?? []).map((order) => ({
                    value: order.id,
                    label: orderRelation?.getDisplay(order) ?? `#${order.id}`,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="productId"
                label="Product"
                rules={[{ required: true, message: 'Product is required' }]}
              >
                <Select
                showSearch
                optionFilterProp="label"
                loading={isProductsLoading}
                placeholder="Select product"
                  options={(products ?? []).map((product) => ({
                    value: product.id,
                    label: productRelation?.getDisplay(product) ?? `#${product.id}`,
                  }))}
                />
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
              <Button onClick={() => navigate(nextPath)}>Cancel</Button>
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
