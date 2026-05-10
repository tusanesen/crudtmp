import { Tag, message } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteOrder, getOrderById } from '../../api/orderApi'
import { EntityDetailView } from '../../core/EntityDetailView'
import { EntityRelationsTabs } from '../../core/EntityRelationsTabs'
import type { RelationTabConfig } from '../../core/EntityRelationsTabs'
import { OrderItemListView } from '../orderItems/OrderItemListView'
import { OrderStatus } from '../../types/enums'

export function OrderDetailView() {
  const { orderId } = useParams<{ orderId: string }>()
  const parsedOrderId = Number(orderId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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

  const tabItems: RelationTabConfig[] = [
    {
      key: 'orderItems',
      label: 'Order Items',
      render: () => <OrderItemListView mode="detailCtx" parentOrderId={parsedOrderId} />,
    },
  ]

  return (
    <EntityDetailView
      entityName="order"
      backTo={{ label: 'Back to Orders', to: '/orders' }}
      title="Order Details"
      invalid={!orderId || !Number.isInteger(parsedOrderId) || parsedOrderId <= 0}
      invalidMessage="Invalid order id."
      error={isError ? error : null}
      errorMessage="Unable to load order"
      data={data}
      isLoading={isLoading}
      fields={[
        { key: 'id', label: 'ID', render: (entity) => entity?.id },
        { key: 'orderNumber', label: 'Order #', render: (entity) => entity?.orderNumber },
        { key: 'customerDisplay', label: 'Customer', render: (entity) => entity?.customerDisplay },
        { key: 'orderDate', label: 'Order Date', render: (entity) => entity?.orderDate },
        {
          key: 'status',
          label: 'Status',
          render: (entity) =>
            entity ? (
              <Tag color={entity.status === OrderStatus.Delivered ? 'green' : 'blue'}>{entity.status}</Tag>
            ) : null,
        },
        {
          key: 'totalAmount',
          label: 'Total Amount',
          render: (entity) => `$${entity?.totalAmount?.toFixed(2) ?? ''}`,
        },
      ]}
      actions={{
        onEdit: (entity) =>
          navigate('/orders/edit', {
            state: {
              entity,
              returnTo: `/orders/${parsedOrderId}`,
            },
          }),
        onDelete: (entity) => deleteMutation.mutate(entity.id),
        isDeleting: deleteMutation.isPending,
      }}
    >
      <EntityRelationsTabs tabs={tabItems} initialActiveKey="orderItems" />
    </EntityDetailView>
  )
}
