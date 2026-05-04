import { Button, Space } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<number | null>(null)

  const { data, isLoading } = useQuery<OrderItem[], Error>({
    queryKey: ['orderItems'],
    queryFn: getOrderItems,
  })

  const selectedOrderItem = data?.find((item) => item.id === selectedOrderItemId)

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Space>
        <Button type="primary" onClick={() => navigate('/order-items/edit')}>
          Create
        </Button>
        <Button
          disabled={!selectedOrderItem}
          onClick={() =>
            navigate('/order-items/edit', {
              state: {
                entity: selectedOrderItem,
              },
            })
          }
        >
          Edit
        </Button>
      </Space>

      <EntityListView<OrderItem>
        apiPath="order-items"
        columns={columns}
        dataSource={data ?? []}
        loading={isLoading}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedOrderItemId ? [selectedOrderItemId] : [],
          onChange: (selectedRowKeys) => {
            const rowKey = selectedRowKeys[0]
            setSelectedOrderItemId(typeof rowKey === 'number' ? rowKey : null)
          },
        }}
      />
    </Space>
  )
}
