import { Table } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { OrderItem } from '../../../types/entities'

const API_BASE_URL = 'http://localhost:3000'

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
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/orderItems`)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      return response.json() as Promise<OrderItem[]>
    },
  })

  return (
    <Table<OrderItem>
      rowKey="id"
      columns={columns}
      dataSource={data ?? []}
      loading={isLoading}
      pagination={{ pageSize: 8 }}
      scroll={{ x: 900 }}
    />
  )
}
