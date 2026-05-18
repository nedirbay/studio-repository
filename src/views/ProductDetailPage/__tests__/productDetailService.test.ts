import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  products: { detail: vi.fn().mockResolvedValue({ id: 5, name: 'P' }) },
  reviews: {
    listByProduct: vi.fn().mockResolvedValue([{ id: 1, rating: 5 }]),
    create: vi.fn().mockResolvedValue({ id: 99 }),
  },
  messages: { create: vi.fn().mockResolvedValue({ id: 11 }) },
}))
vi.mock('../../../repositories', () => ({
  repositories: { products: m.products, reviews: m.reviews, messages: m.messages },
}))

import { productDetailService } from '../productDetailService'

describe('productDetailService', () => {
  it('get fetches product detail', async () => {
    expect((await productDetailService.get(5)).name).toBe('P')
    expect(m.products.detail).toHaveBeenCalledWith(5)
  })

  it('listReviews proxies to reviews repo', async () => {
    expect((await productDetailService.listReviews(5)).length).toBe(1)
  })

  it('postReview forwards rating + content', async () => {
    await productDetailService.postReview(5, { rating: 4, content: 'Solid' })
    expect(m.reviews.create).toHaveBeenCalledWith(5, { rating: 4, content: 'Solid' })
  })

  it('sendContactMessage forwards payload', async () => {
    await productDetailService.sendContactMessage({ subject: 'Q', message: 'm', product: 5 })
    expect(m.messages.create).toHaveBeenCalled()
  })
})
