import { vi, describe, it, expect } from 'vitest'

const svc = vi.hoisted(() => ({
  listCategories: vi.fn().mockResolvedValue([{ id: 1, name: 'Toý' }]),
  listReels: vi.fn().mockResolvedValue([{ id: 1, kind: 'video' }]),
  listCollections: vi.fn().mockResolvedValue([{ id: 1, title: 'C' }]),
  createReel: vi.fn().mockResolvedValue({ id: 2 }),
  updateReel: vi.fn().mockResolvedValue({ id: 1, is_published: true }),
  deleteReel: vi.fn().mockResolvedValue(undefined),
  createCollection: vi.fn().mockResolvedValue({ id: 3 }),
  updateCollection: vi.fn().mockResolvedValue({ id: 1 }),
  deleteCollection: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../PhotoStudioPage/photoStudioService', () => ({ photoStudioService: svc }))

import { adminPhotoStudioService } from '../adminPhotoStudioService'

describe('adminPhotoStudioService', () => {
  it('lists reels and collections', async () => {
    expect((await adminPhotoStudioService.listReels()).length).toBe(1)
    expect((await adminPhotoStudioService.listCollections()).length).toBe(1)
  })

  it('creates a reel', async () => {
    const res = await adminPhotoStudioService.createReel({ title: 'A', media_url: 'x' })
    expect(svc.createReel).toHaveBeenCalledWith({ title: 'A', media_url: 'x' })
    expect(res.id).toBe(2)
  })

  it('setReelPublished forwards an is_published patch', async () => {
    await adminPhotoStudioService.setReelPublished(1, false)
    expect(svc.updateReel).toHaveBeenCalledWith(1, { is_published: false })
  })

  it('deletes a reel and a collection', async () => {
    await adminPhotoStudioService.deleteReel(1)
    await adminPhotoStudioService.deleteCollection(3)
    expect(svc.deleteReel).toHaveBeenCalledWith(1)
    expect(svc.deleteCollection).toHaveBeenCalledWith(3)
  })

  it('updates a collection', async () => {
    await adminPhotoStudioService.updateCollection(1, { title: 'New' })
    expect(svc.updateCollection).toHaveBeenCalledWith(1, { title: 'New' })
  })
})
