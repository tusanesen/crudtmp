import { Tag } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { Product } from '../../types/entities'
import { getProducts } from '../../api/productApi'
import { EntityListView } from '../../core/EntityListView'

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
    queryFn: getProducts,
  })

  return (
    <EntityListView<Product>
      apiPath="products"
      columns={columns}
      dataSource={data ?? []}
      loading={isLoading}
    />
  )
}
