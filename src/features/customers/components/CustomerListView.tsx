import { Table } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { Customer } from '../../../types/entities'

const API_BASE_URL = 'http://localhost:3000'

const columns: ColumnsType<Customer> = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Phone', dataIndex: 'phone', key: 'phone' },
  { title: 'City', dataIndex: 'city', key: 'city' },
]

export function CustomerListView() {
  const { data, isLoading } = useQuery<Customer[], Error>({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/customers`)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      return response.json() as Promise<Customer[]>
    },
  })

  return (
    <Table<Customer>
      rowKey="id"
      columns={columns}
      dataSource={data ?? []}
      loading={isLoading}
      pagination={{ pageSize: 8 }}
      scroll={{ x: 900 }}
    />
  )
}
