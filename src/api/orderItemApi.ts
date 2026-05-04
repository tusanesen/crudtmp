import { getJson } from './apiClient'
import type { OrderItem } from '../types/entities'

export function getOrderItems() {
  return getJson<OrderItem[]>('orderItems')
}
