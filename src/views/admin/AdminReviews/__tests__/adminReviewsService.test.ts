import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  reviews: {
    listAll: vi.fn().mockResolvedValue([{ id: 1 }]),
    remove: vi.fn().mockResolvedValue({ deleted: true })
  }
}))
vi.mock('../../../../repositories', () => ({
  repositories: {
    reviews: m.reviews
  }
}))

import { adminReviewsService } from '../adminReviewsService'

describe('adminReviewsService', () => {
  it('listAll', async () => {
    expect(await adminReviewsService.listAll()).toEqual([{ id: 1 }])
    expect(m.reviews.listAll).toHaveBeenCalled()
  })
  it('remove', async () => {
    expect(await adminReviewsService.remove(1)).toEqual({ deleted: true })
    expect(m.reviews.remove).toHaveBeenCalledWith(1)
  })
})
