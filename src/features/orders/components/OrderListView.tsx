import { Table, Tag } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { Order } from '../../../types/entities'
import { OrderStatus } from '../../../types/enums'

const API_BASE_URL = 'http://localhost:3000'

const columns: ColumnsType<Order> = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber' },
  { title: 'Customer ID', dataIndex: 'customerId', key: 'customerId' },
  { title: 'Date', dataIndex: 'orderDate', key: 'orderDate' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (value: OrderStatus) => (
      <Tag color={value === OrderStatus.Delivered ? 'green' : 'blue'}>{value}</Tag>
    ),
  },
  {
    title: 'Total',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    render: (value: number) => `$${Number(value).toFixed(2)}`,
  },
]

export function OrderListView() {
  const { data, isLoading } = useQuery<Order[], Error>({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/orders`)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      return response.json() as Promise<Order[]>
    },
  })

  return (
    <Table<Order>
      rowKey="id"
      columns={columns}
      dataSource={data ?? []}
      loading={isLoading}
      pagination={{ pageSize: 8 }}
      scroll={{ x: 900 }}
    />
  )
}
