import { getJson } from './apiClient'
import type { Order } from '../types/entities'

export function getOrders() {
  return getJson<Order[]>('orders')
}

export function getOrderById(orderId: number) {
  return getJson<Order>(`orders/${orderId}`)
}
