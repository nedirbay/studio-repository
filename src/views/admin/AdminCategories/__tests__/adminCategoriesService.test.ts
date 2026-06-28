import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  categories: {
    list: vi.fn().mockResolvedValue([{ id: 1 }]),
    create: vi.fn().mockResolvedValue({ id: 2 }),
  }
}))

vi.mock('../../../../repositories', () => ({
  repositories: {
    categories: m.categories
  }
}))

import { adminCategoriesService } from '../adminCategoriesService'

describe('adminCategoriesService', () => {
  it('list', async () => {
    expect((await adminCategoriesService.list()).length).toBe(1)
    expect(m.categories.list).toHaveBeenCalled()
  })
  it('create', async () => {
    const payload = { name: 'Test', slug: 'test', icon: 'icon' }
    expect(await adminCategoriesService.create(payload)).toEqual({ id: 2 })
    expect(m.categories.create).toHaveBeenCalledWith(payload)
  })
})
