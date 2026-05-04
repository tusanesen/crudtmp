import type { OrderStatus } from './enums'

export type Product = {
  id: number
  name: string
  sku: string
  category: string
  price: number
  inStock: boolean
}

export type Customer = {
  id: number
  fullName: string
  email: string
  phone: string
  city: string
}

export type Order = {
  id: number
  orderNumber: string
  customerId: number
  orderDate: string
  status: OrderStatus
  totalAmount: number
}

export type OrderItem = {
  id: number
  orderId: number
  productId: number
  quantity: number
  unitPrice: number
}
