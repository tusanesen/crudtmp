import { Table, Tag } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { Product } from '../../../types/entities'

const API_BASE_URL = 'http://localhost:3000'

const columns: ColumnsType<Product> = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'SKU', dataIndex: 'sku', key: 'sku' },
  { title: 'Category', dataIndex: 'category', key: 'category' },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    render: (value: number) => `$${Number(value).toFixed(2)}`,
  },
  {
    title: 'Stock',
    dataIndex: 'inStock',
    key: 'inStock',
    render: (value: boolean) =>
      value ? <Tag color="green">In Stock</Tag> : <Tag color="red">Out</Tag>,
  },
]

export function ProductListView() {
  const { data, isLoading } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/products`)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      return response.json() as Promise<Product[]>
    },
  })

  return (
    <Table<Product>
      rowKey="id"
      columns={columns}
      dataSource={data ?? []}
      loading={isLoading}
      pagination={{ pageSize: 8 }}
      scroll={{ x: 900 }}
    />
  )
}
