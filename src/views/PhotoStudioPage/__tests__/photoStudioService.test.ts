import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  photoStudio: {
    listCategories: vi.fn().mockResolvedValue([{ id: 1 }]),
    listCollections: vi.fn().mockResolvedValue([{ id: 1, title: 'C' }]),
    fetchCollectionItems: vi.fn().mockResolvedValue([{ id: 1 }]),
    listReels: vi.fn().mockResolvedValue([{ id: 1, kind: 'video' }]),
    registerView: vi.fn().mockResolvedValue({ views: 1 }),
    toggleLike: vi.fn().mockResolvedValue({ liked: true, likes_count: 1 }),
    listComments: vi.fn().mockResolvedValue([]),
    addComment: vi.fn().mockResolvedValue({ id: 9, text: 'hi' }),
    shareReel: vi.fn().mockResolvedValue({ shares_count: 1 }),
  },
}))
vi.mock('../../../repositories', () => ({ repositories: { photoStudio: m.photoStudio } }))

import { photoStudioService } from '../photoStudioService'

describe('photoStudioService', () => {
  it('listCollections forwards filter opts', async () => {
    await photoStudioService.listCollections({ kind: 'video' })
    expect(m.photoStudio.listCollections).toHaveBeenCalledWith({ kind: 'video' })
  })

  it('toggleLike returns liked state', async () => {
    const res = await photoStudioService.toggleLike(3)
    expect(res.liked).toBe(true)
  })

  it('addComment passes parent id', async () => {
    await photoStudioService.addComment(3, 'reply', 7)
    expect(m.photoStudio.addComment).toHaveBeenCalledWith(3, 'reply', 7)
  })

  it('shareReel forwards channel', async () => {
    await photoStudioService.shareReel(3, 'whatsapp')
    expect(m.photoStudio.shareReel).toHaveBeenCalledWith(3, 'whatsapp')
  })

  it('registerView calls repo', async () => {
    await photoStudioService.registerView(3)
    expect(m.photoStudio.registerView).toHaveBeenCalledWith(3)
  })
})
