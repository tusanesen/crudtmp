import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getCustomerById } from '../../api/customerApi'
import { EntityDetailView } from '../../core/EntityDetailView'

export function CustomerDetailView() {
  const { customerId } = useParams<{ customerId: string }>()
  const parsedCustomerId = Number(customerId)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customer', parsedCustomerId],
    queryFn: () => getCustomerById(parsedCustomerId),
    enabled: Number.isInteger(parsedCustomerId) && parsedCustomerId > 0,
  })

  return (
    <EntityDetailView
      entityName="customer"
      backTo={{ label: 'Back to Customers', to: '/customers' }}
      title="Customer Details"
      invalid={!customerId || !Number.isInteger(parsedCustomerId) || parsedCustomerId <= 0}
      invalidMessage="Invalid customer id."
      error={isError ? error : null}
      errorMessage="Unable to load customer"
      data={data}
      isLoading={isLoading}
      fields={[
        { key: 'id', label: 'ID', render: (entity) => entity?.id },
        { key: 'fullName', label: 'Full Name', render: (entity) => entity?.fullName },
        { key: 'email', label: 'Email', render: (entity) => entity?.email },
        { key: 'phone', label: 'Phone', render: (entity) => entity?.phone },
        { key: 'city', label: 'City', render: (entity) => entity?.city },
      ]}
    />
  )
}
