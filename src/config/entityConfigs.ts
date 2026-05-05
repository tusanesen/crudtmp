import { getCustomers } from '../api/customerApi'
import { getOrders } from '../api/orderApi'
import { getProducts } from '../api/productApi'
import type { Customer, Order, OrderItem, Product } from '../types/entities'

export type RelationConfig<TEntity, TRelated extends { id: number }> = {
  field: keyof TEntity & string
  label: string
  queryKey: string
  fetchAll: () => Promise<TRelated[]>
  getDisplay: (related: TRelated) => string
}

export const entityRelations = {
  order: [
    {
      field: 'customerId',
      label: 'Customer',
      queryKey: 'customers',
      fetchAll: getCustomers,
      getDisplay: (customer: Customer) => `${customer.fullName} (#${customer.id})`,
    },
  ] as RelationConfig<Order, Customer>[],
  orderItem: [
    {
      field: 'orderId',
      label: 'Order',
      queryKey: 'orders',
      fetchAll: getOrders,
      getDisplay: (order: Order) => `${order.orderNumber} (#${order.id})`,
    },
    {
      field: 'productId',
      label: 'Product',
      queryKey: 'products',
      fetchAll: getProducts,
      getDisplay: (product: Product) => `${product.name} (${product.sku})`,
    },
  ] as RelationConfig<OrderItem, { id: number }>[],
}

export function getRelationDisplay<TRelated extends { id: number }>(
  relatedItems: TRelated[] | undefined,
  relationId: number | undefined,
  getDisplay: (related: TRelated) => string,
) {
  if (!relationId) {
    return ''
  }

  const related = relatedItems?.find((item) => item.id === relationId)
  return related ? getDisplay(related) : `#${relationId}`
}
