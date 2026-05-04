import { getJson } from './apiClient'
import type { Customer } from '../types/entities'

export function getCustomers() {
  return getJson<Customer[]>('customers')
}
