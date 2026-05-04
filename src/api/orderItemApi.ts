import { getJson, postJson, putJson } from './apiClient'
import type { OrderItem } from '../types/entities'

export type OrderItemPayload = {
  orderId: number
  productId: number
  quantity: number
  unitPrice: number
}

export function getOrderItems() {
  return getJson<OrderItem[]>('orderItems')
}

export function getOrderItemById(orderItemId: number) {
  return getJson<OrderItem>(`orderItems/${orderItemId}`)
}

export function createOrderItem(payload: OrderItemPayload) {
  return postJson<OrderItem, OrderItemPayload>('orderItems', payload)
}

export function updateOrderItem(orderItemId: number, payload: OrderItemPayload) {
  return putJson<OrderItem, OrderItemPayload>(`orderItems/${orderItemId}`, payload)
}
