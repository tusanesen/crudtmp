import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { Customer } from '../../types/entities'
import { getCustomers } from '../../api/customerApi'
import { EntityListView } from '../../core/EntityListView'

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
    queryFn: getCustomers,
  })

  return (
    <EntityListView<Customer>
      apiPath="customers"
      columns={columns}
      dataSource={data ?? []}
      loading={isLoading}
    />
  )
}
