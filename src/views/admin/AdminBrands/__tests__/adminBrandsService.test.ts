import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  brands: {
    list: vi.fn().mockResolvedValue([{ id: 1, name: 'Sony' }]),
    create: vi.fn().mockResolvedValue({ id: 2 }),
    update: vi.fn().mockResolvedValue({ id: 2 }),
    remove: vi.fn().mockResolvedValue({ deleted: true })
  }
}))

vi.mock('../../../../repositories', () => ({
  repositories: {
    brands: m.brands
  }
}))

import { adminBrandsService } from '../adminBrandsService'

describe('adminBrandsService', () => {
  it('list', async () => {
    const res = await adminBrandsService.list()
    expect(res).toEqual([{ id: 1, name: 'Sony' }])
    expect(m.brands.list).toHaveBeenCalled()
  })

  it('create', async () => {
    const payload = { name: 'Canon', slug: 'canon', logo_url: 'url' }
    const res = await adminBrandsService.create(payload)
    expect(res).toEqual({ id: 2 })
    expect(m.brands.create).toHaveBeenCalledWith(payload)
  })

  it('update', async () => {
    const payload = { name: 'Canon Updated' }
    const res = await adminBrandsService.update(2, payload)
    expect(res).toEqual({ id: 2 })
    expect(m.brands.update).toHaveBeenCalledWith(2, payload)
  })

  it('remove', async () => {
    const res = await adminBrandsService.remove(2)
    expect(res).toEqual({ deleted: true })
    expect(m.brands.remove).toHaveBeenCalledWith(2)
  })
})
