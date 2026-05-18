import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  blogs: { detail: vi.fn().mockResolvedValue({ id: 1, slug: 'hello' }) },
}))
vi.mock('../../../repositories', () => ({ repositories: { blogs: m.blogs } }))

import { blogDetailService } from '../blogDetailService'

describe('blogDetailService', () => {
  it('get fetches by slug', async () => {
    const res = await blogDetailService.get('hello')
    expect(m.blogs.detail).toHaveBeenCalledWith('hello')
    expect(res.slug).toBe('hello')
  })
})
