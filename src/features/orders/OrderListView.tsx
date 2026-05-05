import { Tag } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { Customer, Order } from '../../types/entities'
import { OrderStatus } from '../../types/enums'
import { getOrders } from '../../api/orderApi'
import { entityRelations, getRelationDisplay } from '../../config/entityConfigs'
import { EntityListView } from '../../core/EntityListView'

export function OrderListView() {
  const { data, isLoading } = useQuery<Order[], Error>({
    queryKey: ['orders'],
    queryFn: getOrders,
  })
  const customerRelation = entityRelations.order[0]
  const { data: customers } = useQuery<Customer[], Error>({
    queryKey: [customerRelation.queryKey],
    queryFn: customerRelation.fetchAll,
  })

  const columns: ColumnsType<Order> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber' },
    {
      title: 'Customer',
      dataIndex: 'customerId',
      key: 'customerId',
      render: (value: number) => getRelationDisplay(customers, value, customerRelation.getDisplay),
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
    />
  )
}
