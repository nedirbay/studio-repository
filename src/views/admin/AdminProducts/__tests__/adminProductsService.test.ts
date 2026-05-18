import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  products: {
    list: vi.fn().mockResolvedValue([{ id: 1 }]),
    create: vi.fn().mockResolvedValue({ id: 9 }),
    update: vi.fn().mockResolvedValue({ updated: true }),
    remove: vi.fn().mockResolvedValue({ deleted: true }),
  },
  uploads: { uploadImage: vi.fn().mockResolvedValue({ url: '/m/x.jpg' }) },
}))
vi.mock('../../../../repositories', () => ({
  repositories: { products: m.products, uploads: m.uploads },
}))

import { adminProductsService } from '../adminProductsService'

describe('adminProductsService', () => {
  it('CRUD endpoints', async () => {
    expect((await adminProductsService.list()).length).toBe(1)
    expect((await adminProductsService.create({ name: 'X', price: 10, category: 1 })).id).toBe(9)
    expect((await adminProductsService.update(9, { instock: false })).updated).toBe(true)
    expect((await adminProductsService.remove(9)).deleted).toBe(true)
  })

  it('upload returns url', async () => {
    const file = new File(['x'], 'x.jpg', { type: 'image/jpeg' })
    const res = await adminProductsService.upload(file)
    expect(res.url).toBe('/m/x.jpg')
  })
})
