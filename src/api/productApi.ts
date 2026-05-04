import { getJson } from './apiClient'
import type { Product } from '../types/entities'

export function getProducts() {
  return getJson<Product[]>('products')
}

export function getProductById(productId: number) {
  return getJson<Product>(`products/${productId}`)
}
