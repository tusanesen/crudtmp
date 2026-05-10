import { message } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteOrderItem, getOrderItemById } from '../../api/orderItemApi'
import { EntityDetailView } from '../../core/EntityDetailView'
import type { OrderItem } from '../../types/entities'

type OrderItemDetailViewProps = {
  mode?: 'page' | 'detailCtx'
  orderItemId?: number
  onOpenEdit?: (entity: OrderItem) => void
  onClose?: () => void
}

export function OrderItemDetailView({
  mode = 'page',
  orderItemId: propOrderItemId,
  onOpenEdit,
  onClose,
}: OrderItemDetailViewProps) {
  const { orderItemId: routeOrderItemId } = useParams<{ orderItemId: string }>()
  const parsedOrderItemId = mode === 'detailCtx' ? Number(propOrderItemId) : Number(routeOrderItemId)
  const orderItemId = mode === 'detailCtx' ? String(propOrderItemId ?? '') : routeOrderItemId
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
      if (mode === 'detailCtx') {
        onClose?.()
        return
      }
      navigate('/order-items')
    },
    onError: (mutationError: Error) => {
      message.error(`Unable to delete order item: ${mutationError.message}`)
    },
  })

  return (
    <EntityDetailView
      entityName="order item"
      backTo={mode === 'page' ? { label: 'Back to Order Items', to: '/order-items' } : undefined}
      title="Order Item Details"
      invalid={!orderItemId || !Number.isInteger(parsedOrderItemId) || parsedOrderItemId <= 0}
      invalidMessage="Invalid order item id."
      error={isError ? error : null}
      errorMessage="Unable to load order item"
      data={data}
      isLoading={isLoading}
      fields={[
        { key: 'id', label: 'ID', render: (entity) => entity?.id },
        { key: 'orderDisplay', label: 'Order', render: (entity) => entity?.orderDisplay },
        { key: 'productDisplay', label: 'Product', render: (entity) => entity?.productDisplay },
        { key: 'quantity', label: 'Quantity', render: (entity) => entity?.quantity },
        {
          key: 'unitPrice',
          label: 'Unit Price',
          render: (entity) => `$${entity?.unitPrice?.toFixed(2) ?? ''}`,
        },
        {
          key: 'lineTotal',
          label: 'Line Total',
          render: (entity) => (entity ? `$${(entity.quantity * entity.unitPrice).toFixed(2)}` : ''),
        },
      ]}
      actions={{
        onEdit: (entity) => {
          if (mode === 'detailCtx') {
            onOpenEdit?.(entity)
            return
          }

          navigate('/order-items/edit', {
            state: {
              entity,
              returnTo: `/order-items/${parsedOrderItemId}`,
            },
          })
        },
        onDelete: (entity) => deleteMutation.mutate(entity.id),
        isDeleting: deleteMutation.isPending,
      }}
    />
  )
}
