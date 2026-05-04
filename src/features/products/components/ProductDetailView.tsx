import { Card, Descriptions, Space, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getProductById } from '../../../api/productApi'

const { Text, Title } = Typography

export function ProductDetailView() {
  const { productId } = useParams<{ productId: string }>()
  const parsedProductId = Number(productId)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', parsedProductId],
    queryFn: () => getProductById(parsedProductId),
    enabled: Number.isInteger(parsedProductId) && parsedProductId > 0,
  })

  if (!productId || !Number.isInteger(parsedProductId) || parsedProductId <= 0) {
    return <Text type="danger">Invalid product id.</Text>
  }

  if (isError) {
    return <Text type="danger">Unable to load product: {error.message}</Text>
  }

  return (
    <Space direction="vertical" size={16} className="entity-page">
      <Link to="/products">Back to Products</Link>
      <Card loading={isLoading}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>
            Product Details
          </Title>
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="ID">{data?.id}</Descriptions.Item>
            <Descriptions.Item label="Name">{data?.name}</Descriptions.Item>
            <Descriptions.Item label="SKU">{data?.sku}</Descriptions.Item>
            <Descriptions.Item label="Category">{data?.category}</Descriptions.Item>
            <Descriptions.Item label="Price">${data?.price?.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="In Stock">{data?.inStock ? 'Yes' : 'No'}</Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </Space>
  )
}
