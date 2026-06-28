import { describe, it, expect, beforeEach } from 'vitest'
import { CartService } from '../cartService'
import { OrderRepository } from '../../repositories'
import { makeTestClient } from '../../repositories/__tests__/_testClient'
import type { Product } from '../../types'

function makeProduct(id: number, price: number): Product {
  return {
    id, name: `P${id}`, price, image: '', category: 'c',
    rating: 5, reviews: 0, brand: 'b', inStock: true,
  }
}

let cart: CartService
let mock: ReturnType<typeof makeTestClient>['mock']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  cart = new CartService([], new OrderRepository(t.client))
})

describe('CartService', () => {
  it('adds a new item', () => {
    cart.add(makeProduct(1, 50))
    expect(cart.count()).toBe(1)
    expect(cart.total()).toBe(50)
  })

  it('merges quantities when adding the same product', () => {
    const p = makeProduct(1, 50)
    cart.add(p, 2)
    cart.add(p, 3)
    expect(cart.count()).toBe(5)
    expect(cart.total()).toBe(250)
  })

  it('removes by product id', () => {
    cart.add(makeProduct(1, 10))
    cart.add(makeProduct(2, 20))
    cart.remove(1)
    expect(cart.getItems().map(i => i.product.id)).toEqual([2])
  })

  it('setQuantity floors at 1', () => {
    const p = makeProduct(1, 10)
    cart.add(p, 3)
    cart.setQuantity(1, 0)
    expect(cart.getItems()[0].quantity).toBe(1)
  })

  it('clear empties cart', () => {
    cart.add(makeProduct(1, 10))
    cart.clear()
    expect(cart.count()).toBe(0)
  })

  it('submitOrder sends total + paid_amount, then clears cart', async () => {
    cart.add(makeProduct(1, 100), 2) // total 200
    mock.onPost('commerce/orders').reply((config) => {
      const body = JSON.parse(config.data)
      expect(body.total_amount).toBe(200)
      expect(body.paid_amount).toBe(0)
      expect(body.customer_name).toBe('Alice')
      return [201, { id: 42 }]
    })
    const res = await cart.submitOrder({ customer_name: 'Alice', customer_phone: '111' })
    expect(res.id).toBe(42)
    expect(cart.count()).toBe(0)
  })

  it('submitOrder propagates backend error and keeps the cart intact', async () => {
    cart.add(makeProduct(1, 50))
    mock.onPost('commerce/orders').reply(400, { error: 'bad' })
    await expect(
      cart.submitOrder({ customer_name: 'A', customer_phone: 'X' })
    ).rejects.toThrow()
    expect(cart.count()).toBe(1)
  })
})
