import { getJson } from './apiClient'
import type { Product } from '../types/entities'

export function getProducts() {
  return getJson<Product[]>('products')
}
