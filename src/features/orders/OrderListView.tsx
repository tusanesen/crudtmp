import { Tag } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { Order } from '../../types/entities'
import { OrderStatus } from '../../types/enums'
import { getOrders } from '../../api/orderApi'
import { EntityListView } from '../../core/EntityListView'

export function OrderListView() {
  const { data, isLoading } = useQuery<Order[], Error>({
    queryKey: ['orders'],
    queryFn: getOrders,
  })
  const columns: ColumnsType<Order> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber' },
    {
      title: 'Customer',
      dataIndex: 'customerDisplay',
      key: 'customerId',
    },
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

  return (
    <EntityListView<Order>
      apiPath="orders"
      columns={columns}
      dataSource={data ?? []}
      loading={isLoading}
      enableCreateEditActions
    />
  )
}
