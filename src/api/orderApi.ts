import { getJson } from './apiClient'
import type { Order } from '../types/entities'

export function getOrders() {
  return getJson<Order[]>('orders')
}
