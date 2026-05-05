import { deleteJson, getJson, postJson, putJson } from './apiClient'
import type { Order } from '../types/entities'

export type OrderPayload = {
  orderNumber: string
  customerId: number
  customerDisplay: string
  orderDate: string
  status: Order['status']
  totalAmount: number
}

export function getOrders() {
  return getJson<Order[]>('orders')
}

export function getOrderById(orderId: number) {
  return getJson<Order>(`orders/${orderId}`)
}

export function createOrder(payload: OrderPayload) {
  return postJson<Order, OrderPayload>('orders', payload)
}

export function updateOrder(orderId: number, payload: OrderPayload) {
  return putJson<Order, OrderPayload>(`orders/${orderId}`, payload)
}

export function deleteOrder(orderId: number) {
  return deleteJson(`orders/${orderId}`)
}
