import { Table } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import type { Customer } from '../../types/entities'
import { getCustomers } from '../../api/customerApi'

const columns: ColumnsType<Customer> = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Phone', dataIndex: 'phone', key: 'phone' },
  { title: 'City', dataIndex: 'city', key: 'city' },
]

export function CustomerListView() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery<Customer[], Error>({
    queryKey: ['customers'],
    queryFn: getCustomers,
  })

  return (
    <Table<Customer>
      rowKey="id"
      columns={columns}
      dataSource={data ?? []}
      loading={isLoading}
      pagination={{ pageSize: 8 }}
      scroll={{ x: 900 }}
      onRow={(record) => ({
        onClick: () => navigate(`/customers/${record.id}`),
        style: { cursor: 'pointer' },
      })}
    />
  )
}
