import type { OrderStatus } from './enums'

export type EntityBase = {
  id: number
}

export type Product = EntityBase & {
  name: string
  sku: string
  category: string
  price: number
  inStock: boolean
}

export type Customer = EntityBase & {
  fullName: string
  email: string
  phone: string
  city: string
}

export type Order = EntityBase & {
  orderNumber: string
  customerId: number
  customerDisplay: string
  orderDate: string
  status: OrderStatus
  totalAmount: number
}

export type OrderItem = EntityBase & {
  orderId: number
  orderDisplay: string
  productId: number
  productDisplay: string
  quantity: number
  unitPrice: number
}
