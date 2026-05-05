import { Button, Card, DatePicker, Form, Input, InputNumber, Select, Space, Typography } from 'antd'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createOrder, updateOrder, type OrderPayload } from '../../api/orderApi'
import { entityRelations } from '../../config/entityConfigs'
import type { Order } from '../../types/entities'
import { OrderStatus } from '../../types/enums'

const { Text, Title } = Typography

type LocationState = {
  entity?: Order
  returnTo?: string
}

type OrderFormValues = {
  orderNumber: string
  customerId: number
  orderDate: dayjs.Dayjs
  status: OrderStatus
  totalAmount: number
}

export function OrderEditView() {
  const [form] = Form.useForm<OrderFormValues>()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { entity, returnTo } = (location.state as LocationState | null) ?? {}
  const fallbackReturnPath = entity ? `/orders/${entity.id}` : '/orders'
  const nextPath = returnTo ?? fallbackReturnPath
  const isUpdateMode = Boolean(entity)

  const relationQueries = useQueries({
    queries: entityRelations.order.map((relation) => ({
      queryKey: [relation.queryKey],
      queryFn: relation.fetchAll,
    })),
  })

  const customerRelation = entityRelations.order[0]
  const customers = relationQueries[0]?.data ?? []
  const isCustomersLoading = relationQueries[0]?.isLoading ?? false

  const mutation = useMutation({
    mutationFn: async (values: OrderFormValues) => {
      const customer = customers.find((item) => item.id === values.customerId)
      const payload: OrderPayload = {
        orderNumber: values.orderNumber,
        customerId: values.customerId,
        customerDisplay: customer ? customerRelation.getDisplay(customer) : `#${values.customerId}`,
        orderDate: values.orderDate.format('YYYY-MM-DD'),
        status: values.status,
        totalAmount: values.totalAmount,
      }

      if (entity) {
        return updateOrder(entity.id, payload)
      }

      return createOrder(payload)
    },
    onSuccess: async (savedEntity) => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
      if (returnTo) {
        navigate(returnTo)
        return
      }
      navigate(`/orders/${savedEntity.id}`)
    },
  })

  const initialValues: OrderFormValues | undefined = entity
    ? {
        orderNumber: entity.orderNumber,
        customerId: entity.customerId,
        orderDate: dayjs(entity.orderDate),
        status: entity.status,
        totalAmount: entity.totalAmount,
      }
    : undefined

  return (
    <Space direction="vertical" size={16} className="entity-page">
      <Link to={nextPath}>Back</Link>
      <Card>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>
            {isUpdateMode ? 'Edit Order' : 'Create Order'}
          </Title>
          <Text type="secondary">Mode: {isUpdateMode ? 'Update' : 'Create'}</Text>

          <Form<OrderFormValues>
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={(values) => mutation.mutate(values)}
          >
            <Form.Item
              name="orderNumber"
              label="Order #"
              rules={[{ required: true, message: 'Order number is required' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="customerId"
              label="Customer"
              rules={[{ required: true, message: 'Customer is required' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={isCustomersLoading}
                placeholder="Select customer"
                options={customers.map((customer) => ({
                  value: customer.id,
                  label: customerRelation.getDisplay(customer),
                }))}
              />
            </Form.Item>

            <Form.Item
              name="orderDate"
              label="Order Date"
              rules={[{ required: true, message: 'Order date is required' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Status is required' }]}
            >
              <Select
                options={Object.values(OrderStatus).map((status) => ({
                  label: status,
                  value: status,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="totalAmount"
              label="Total Amount"
              rules={[{ required: true, message: 'Total amount is required' }]}
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

          {mutation.isError ? <Text type="danger">Unable to save order: {mutation.error.message}</Text> : null}
        </Space>
      </Card>
    </Space>
  )
}
