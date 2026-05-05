import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { Order, OrderItem, Product } from '../../types/entities'
import { getOrderItems } from '../../api/orderItemApi'
import { entityRelations, getRelationDisplay } from '../../config/entityConfigs'
import { EntityListView } from '../../core/EntityListView'

export function OrderItemListView() {
  const { data, isLoading } = useQuery<OrderItem[], Error>({
    queryKey: ['orderItems'],
    queryFn: getOrderItems,
  })
  const orderRelation = entityRelations.orderItem.find((relation) => relation.field === 'orderId')
  const productRelation = entityRelations.orderItem.find((relation) => relation.field === 'productId')
  const { data: orders } = useQuery<Order[], Error>({
    queryKey: [orderRelation?.queryKey ?? 'orders'],
    queryFn: () => orderRelation?.fetchAll() ?? Promise.resolve([]),
  })
  const { data: products } = useQuery<Product[], Error>({
    queryKey: [productRelation?.queryKey ?? 'products'],
    queryFn: () => productRelation?.fetchAll() ?? Promise.resolve([]),
  })

  const columns: ColumnsType<OrderItem> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    {
      title: 'Order',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (value: number) =>
        orderRelation ? getRelationDisplay(orders, value, orderRelation.getDisplay) : `#${value}`,
    },
    {
      title: 'Product',
      dataIndex: 'productId',
      key: 'productId',
      render: (value: number) =>
        productRelation ? getRelationDisplay(products, value, productRelation.getDisplay) : `#${value}`,
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
    />
  )
}
