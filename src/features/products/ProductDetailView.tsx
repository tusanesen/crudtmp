import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getProductById } from '../../api/productApi'
import { EntityDetailView } from '../../core/EntityDetailView'

export function ProductDetailView() {
  const { productId } = useParams<{ productId: string }>()
  const parsedProductId = Number(productId)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', parsedProductId],
    queryFn: () => getProductById(parsedProductId),
    enabled: Number.isInteger(parsedProductId) && parsedProductId > 0,
  })

  return (
    <EntityDetailView
      entityName="product"
      backTo={{ label: 'Back to Products', to: '/products' }}
      title="Product Details"
      invalid={!productId || !Number.isInteger(parsedProductId) || parsedProductId <= 0}
      invalidMessage="Invalid product id."
      error={isError ? error : null}
      errorMessage="Unable to load product"
      data={data}
      isLoading={isLoading}
      fields={[
        { key: 'id', label: 'ID', render: (entity) => entity?.id },
        { key: 'name', label: 'Name', render: (entity) => entity?.name },
        { key: 'sku', label: 'SKU', render: (entity) => entity?.sku },
        { key: 'category', label: 'Category', render: (entity) => entity?.category },
        { key: 'price', label: 'Price', render: (entity) => `$${entity?.price?.toFixed(2) ?? ''}` },
        { key: 'inStock', label: 'In Stock', render: (entity) => (entity?.inStock ? 'Yes' : 'No') },
      ]}
    />
  )
}
