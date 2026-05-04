import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { OrderItem } from '../../types/entities'
import { getOrderItems } from '../../api/orderItemApi'
import { EntityListView } from '../../core/EntityListView'

const columns: ColumnsType<OrderItem> = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Order ID', dataIndex: 'orderId', key: 'orderId' },
  { title: 'Product ID', dataIndex: 'productId', key: 'productId' },
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

export function OrderItemListView() {
  const { data, isLoading } = useQuery<OrderItem[], Error>({
    queryKey: ['orderItems'],
    queryFn: getOrderItems,
  })

  return (
    <EntityListView<OrderItem>
      apiPath="order-items"
      columns={columns}
      dataSource={data ?? []}
      loading={isLoading}
    />
  )
}
