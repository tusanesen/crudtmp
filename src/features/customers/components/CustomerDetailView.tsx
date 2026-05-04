import { Card, Descriptions, Space, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getCustomerById } from '../../../api/customerApi'

const { Text, Title } = Typography

export function CustomerDetailView() {
  const { customerId } = useParams<{ customerId: string }>()
  const parsedCustomerId = Number(customerId)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customer', parsedCustomerId],
    queryFn: () => getCustomerById(parsedCustomerId),
    enabled: Number.isInteger(parsedCustomerId) && parsedCustomerId > 0,
  })

  if (!customerId || !Number.isInteger(parsedCustomerId) || parsedCustomerId <= 0) {
    return <Text type="danger">Invalid customer id.</Text>
  }

  if (isError) {
    return <Text type="danger">Unable to load customer: {error.message}</Text>
  }

  return (
    <Space direction="vertical" size={16} className="entity-page">
      <Link to="/customers">Back to Customers</Link>
      <Card loading={isLoading}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>
            Customer Details
          </Title>
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="ID">{data?.id}</Descriptions.Item>
            <Descriptions.Item label="Full Name">{data?.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{data?.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{data?.phone}</Descriptions.Item>
            <Descriptions.Item label="City">{data?.city}</Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </Space>
  )
}
