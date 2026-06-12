import { vi, describe, it, expect } from 'vitest'

// `photoStudioService` instantiates `new PhotoStudioRepository()` at module
// load, so we mock the repository class to return a fully stubbed instance.
const inst = vi.hoisted(() => ({
  listCategories: vi.fn().mockResolvedValue([{ id: 1 }]),
  listCollections: vi.fn().mockResolvedValue([{ id: 1, title: 'C' }]),
  fetchCollectionItems: vi.fn().mockResolvedValue([{ id: 1 }]),
  listReels: vi.fn().mockResolvedValue([{ id: 1, kind: 'video' }]),
  registerView: vi.fn().mockResolvedValue({ views: 1 }),
  toggleLike: vi.fn().mockResolvedValue({ liked: true, likes_count: 1 }),
  listComments: vi.fn().mockResolvedValue([]),
  addComment: vi.fn().mockResolvedValue({ id: 9, text: 'hi' }),
  shareReel: vi.fn().mockResolvedValue({ shares_count: 1 }),
  createReel: vi.fn().mockResolvedValue({ id: 2 }),
  updateReel: vi.fn().mockResolvedValue({ id: 1, is_published: false }),
  deleteReel: vi.fn().mockResolvedValue(undefined),
  createCollection: vi.fn().mockResolvedValue({ id: 3 }),
  updateCollection: vi.fn().mockResolvedValue({ id: 1 }),
  deleteCollection: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../photoStudioRepository', () => ({
  // A class whose constructor returns our stub instance.
  PhotoStudioRepository: class {
    constructor() {
      return inst
    }
  },
}))

import { photoStudioService } from '../photoStudioService'

describe('photoStudioService', () => {
  it('listCollections forwards filter opts', async () => {
    await photoStudioService.listCollections({ kind: 'video' })
    expect(inst.listCollections).toHaveBeenCalledWith({ kind: 'video' })
  })

  it('toggleLike returns liked state', async () => {
    const res = await photoStudioService.toggleLike(3)
    expect(res.liked).toBe(true)
  })

  it('addComment passes parent id', async () => {
    await photoStudioService.addComment(3, 'reply', 7)
    expect(inst.addComment).toHaveBeenCalledWith(3, 'reply', 7)
  })

  it('shareReel forwards channel', async () => {
    await photoStudioService.shareReel(3, 'whatsapp')
    expect(inst.shareReel).toHaveBeenCalledWith(3, 'whatsapp')
  })

  it('registerView calls repo', async () => {
    await photoStudioService.registerView(3)
    expect(inst.registerView).toHaveBeenCalledWith(3)
  })

  // Admin management
  it('createReel forwards the payload', async () => {
    await photoStudioService.createReel({ title: 'A', media_url: 'x' })
    expect(inst.createReel).toHaveBeenCalledWith({ title: 'A', media_url: 'x' })
  })

  it('updateReel forwards id + payload', async () => {
    await photoStudioService.updateReel(1, { is_published: false })
    expect(inst.updateReel).toHaveBeenCalledWith(1, { is_published: false })
  })

  it('deleteCollection forwards id', async () => {
    await photoStudioService.deleteCollection(3)
    expect(inst.deleteCollection).toHaveBeenCalledWith(3)
  })
})
