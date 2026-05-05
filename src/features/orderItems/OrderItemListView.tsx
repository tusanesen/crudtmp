import { useQuery } from '@tanstack/react-query'
import type { TableProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { OrderItem } from '../../types/entities'
import { getOrderItems } from '../../api/orderItemApi'
import { EntityListView } from '../../core/EntityListView'

type OrderItemListViewProps = {
  mode?: 'page' | 'detailCtx'
  parentOrderId?: number
  onOpenDetail?: (orderItemId: number) => void
  onOpenEdit?: (entity: OrderItem) => void
  onOpenCreate?: (parentOrderId?: number) => void
}

export function OrderItemListView({
  mode = 'page',
  parentOrderId,
  onOpenDetail,
  onOpenEdit,
  onOpenCreate,
}: OrderItemListViewProps) {
  const isDetailContext = mode === 'detailCtx'
  const { data, isLoading } = useQuery<OrderItem[], Error>({
    queryKey: ['orderItems', { orderId: parentOrderId }],
    queryFn: () => getOrderItems(isDetailContext ? { orderId: parentOrderId } : undefined),
  })

  const detailContextRow: TableProps<OrderItem>['onRow'] | undefined = isDetailContext
    ? (record) => ({
        onClick: (event) => {
          const target = event.target as HTMLElement
          if (target.closest('.ant-table-selection-column')) {
            return
          }

          onOpenDetail?.(record.id)
        },
        style: { cursor: 'pointer' },
      })
    : undefined

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
      dataSource={data ?? []}
      loading={isLoading}
      enableCreateEditActions
      onRow={detailContextRow}
      onCreateAction={
        isDetailContext
          ? () => {
              onOpenCreate?.(parentOrderId)
            }
          : undefined
      }
      onEditAction={isDetailContext ? onOpenEdit : undefined}
    />
  )
}
