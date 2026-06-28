import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  products: { list: vi.fn().mockResolvedValue([{ id: 1 }]) },
  users: { list: vi.fn().mockResolvedValue([{ id: 2 }]) },
  orders: { list: vi.fn().mockResolvedValue([{ id: 3 }]) },
  reviews: { listAll: vi.fn().mockResolvedValue([{ id: 4 }]) },
}))
vi.mock('../../../../repositories', () => ({
  repositories: {
    products: m.products,
    users: m.users,
    orders: m.orders,
    reviews: m.reviews,
  }
}))

import { adminDashboardService } from '../adminDashboardService'

describe('adminDashboardService', () => {
  it('loadSummary', async () => {
    const summary = await adminDashboardService.loadSummary()
    expect(summary).toEqual({
      products: [{ id: 1 }],
      users: [{ id: 2 }],
      orders: [{ id: 3 }],
      reviews: [{ id: 4 }]
    })
    expect(m.products.list).toHaveBeenCalled()
    expect(m.users.list).toHaveBeenCalled()
    expect(m.orders.list).toHaveBeenCalled()
    expect(m.reviews.listAll).toHaveBeenCalled()
  })
})
