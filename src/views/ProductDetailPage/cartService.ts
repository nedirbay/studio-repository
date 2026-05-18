import type { CartItem, Product } from '../../types'
import { OrderRepository, type OrderPayload } from '../admin/AdminOrders/orderRepository'

/**
 * Pure in-memory cart with checkout via OrderRepository. Keeping it
 * framework-agnostic makes the math trivially testable; the Vue store can
 * wrap an instance for reactivity.
 */
export class CartService {
  private items: CartItem[] = []

  constructor(
    initial: CartItem[] = [],
    private orderRepo: OrderRepository = new OrderRepository(),
  ) {
    this.items = [...initial]
  }

  getItems(): CartItem[] {
    return [...this.items]
  }

  add(product: Product, qty: number = 1) {
    const existing = this.items.find(i => i.product.id === product.id)
    if (existing) {
      existing.quantity += qty
    } else {
      this.items.push({ id: String(product.id), product, quantity: qty })
    }
  }

  remove(productId: number) {
    this.items = this.items.filter(i => i.product.id !== productId)
  }

  setQuantity(productId: number, qty: number) {
    const item = this.items.find(i => i.product.id === productId)
    if (item) item.quantity = Math.max(1, qty)
  }

  clear() {
    this.items = []
  }

  count(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0)
  }

  total(): number {
    return this.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  }

  async submitOrder(customer: { customer_name: string; customer_phone: string }) {
    const payload: OrderPayload = {
      customer_name: customer.customer_name,
      customer_phone: customer.customer_phone,
      total_amount: this.total(),
      paid_amount: 0,
    }
    const res = await this.orderRepo.create(payload)
    this.clear()
    return res
  }
}
