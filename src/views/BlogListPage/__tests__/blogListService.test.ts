import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  blogs: {
    list: vi.fn().mockResolvedValue({ count: 10, results: [{ id: 1 }], page: 1, page_size: 6 }),
  },
}))
vi.mock('../../../repositories', () => ({ repositories: { blogs: m.blogs } }))

import { blogListService } from '../blogListService'

describe('blogListService', () => {
  it('list passes page params', async () => {
    const res = await blogListService.list(2, 5)
    expect(m.blogs.list).toHaveBeenCalledWith(2, 5)
    expect(res.count).toBe(10)
  })
})
