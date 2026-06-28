import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  banners: {
    list: vi.fn().mockResolvedValue([{ id: 1 }]),
    create: vi.fn().mockResolvedValue({ id: 2 }),
    update: vi.fn().mockResolvedValue({ id: 1 }),
    remove: vi.fn().mockResolvedValue({ deleted: true }),
  },
  uploads: {
    uploadImage: vi.fn().mockResolvedValue('http://image.url'),
  }
}))
vi.mock('../../../../repositories', () => ({
  repositories: {
    banners: m.banners,
    uploads: m.uploads
  }
}))

import { adminBannersService } from '../adminBannersService'

describe('adminBannersService', () => {
  it('list', async () => {
    expect((await adminBannersService.list()).length).toBe(1)
  })
  it('create', async () => {
    const payload = { title: 'Test', image: 'url' }
    expect(await adminBannersService.create(payload)).toEqual({ id: 2 })
    expect(m.banners.create).toHaveBeenCalledWith(payload)
  })
  it('update', async () => {
    const payload = { id: 1, title: 'Updated', image: 'url' }
    expect(await adminBannersService.update(payload)).toEqual({ id: 1 })
    expect(m.banners.update).toHaveBeenCalledWith(payload)
  })
  it('remove', async () => {
    expect((await adminBannersService.remove(1)).deleted).toBe(true)
    expect(m.banners.remove).toHaveBeenCalledWith(1)
  })
  it('upload', async () => {
    const dummyFile = new File([''], 'test.png', { type: 'image/png' })
    expect(await adminBannersService.upload(dummyFile)).toBe('http://image.url')
    expect(m.uploads.uploadImage).toHaveBeenCalledWith(dummyFile)
  })
})
