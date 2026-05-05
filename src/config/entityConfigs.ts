import { getOrders } from '../api/orderApi'
import { getProducts } from '../api/productApi'
import type { EntityBase, Order, OrderItem, Product } from '../types/entities'

export type RelationConfig<TEntity, TRelated extends EntityBase> = {
  field: keyof TEntity & string
  label: string
  queryKey: string
  fetchAll: () => Promise<TRelated[]>
  getDisplay: (related: TRelated) => string
}

export const entityRelations = {
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
