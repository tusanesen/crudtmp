import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { OrderItem } from '../../types/entities'
import { getOrderItems } from '../../api/orderItemApi'
import { EntityListView } from '../../core/EntityListView'
import { OrderItemDetailView } from './OrderItemDetailView'
import { OrderItemEditView } from './OrderItemEditView'

const sortableColumns = {
  id: { type: 'number', defaultOrder: 'descend' },
  orderId: { type: 'string', value: (record: OrderItem) => record.orderDisplay },
  productId: { type: 'string', value: (record: OrderItem) => record.productDisplay },
  quantity: { type: 'number' },
  unitPrice: { type: 'number' },
  lineTotal: { type: 'number', value: (record: OrderItem) => record.quantity * record.unitPrice },
} as const

type OrderItemListViewProps = {
  mode?: 'page' | 'detailCtx'
  parentOrderId?: number
}

export function OrderItemListView({
  mode = 'page',
  parentOrderId,
}: OrderItemListViewProps) {
  const isDetailContext = mode === 'detailCtx'
  const { data, isLoading } = useQuery<OrderItem[], Error>({
    queryKey: ['orderItems', { orderId: parentOrderId }],
    queryFn: () => getOrderItems(isDetailContext ? { orderId: parentOrderId } : undefined),
  })

  const columns: ColumnsType<OrderItem> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    {
      title: 'Order',
      dataIndex: 'orderDisplay',
      key: 'orderId',
    },
    {
      title: 'Product',
      dataIndex: 'productDisplay',
      key: 'productId',
    },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (value: number) => `$${Number(value).toFixed(2)}`,
    },
    {
      title: 'Line Total',
      key: 'lineTotal',
      render: (_, record) => `$${(record.quantity * record.unitPrice).toFixed(2)}`,
    },
  ]

  return (
    <EntityListView<OrderItem>
      apiPath="order-items"
      columns={columns}
      sortableColumns={sortableColumns}
      dataSource={data ?? []}
      loading={isLoading}
      enableCreateEditActions
      detailContext={
        isDetailContext
          ? {
              detail: {
                title: 'Order Item Details',
                width: 900,
                render: ({ entityId, close, openEdit }) => (
                  <OrderItemDetailView
                    mode="detailCtx"
                    orderItemId={entityId}
                    onOpenEdit={openEdit}
                    onClose={close}
                  />
                ),
              },
              edit: {
                title: 'Edit Order Item',
                width: 900,
                render: ({ entity, close }) => (
                  <OrderItemEditView
                    mode="detailCtx"
                    parentOrderId={parentOrderId}
                    entity={entity}
                    onSaved={close}
                    onClose={close}
                  />
                ),
              },
              create: {
                title: 'Create Order Item',
                width: 900,
                render: ({ close }) => (
                  <OrderItemEditView
                    mode="detailCtx"
                    parentOrderId={parentOrderId}
                    onSaved={close}
                    onClose={close}
                  />
                ),
              },
            }
          : undefined
      }
    />
  )
}
