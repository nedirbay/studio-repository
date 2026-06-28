import { vi, describe, it, expect } from 'vitest'

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()
const mockDelete = vi.fn()

vi.mock('../../../../utils/http', () => ({
  defaultHttpClient: () => ({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
  })
}))

import { adminPhotoStudioService } from '../adminPhotoStudioService'

describe('adminPhotoStudioService', () => {
  it('lists videos and images', async () => {
    mockGet.mockResolvedValueOnce({ data: { count: 1, results: [{ id: 1, title: 'Video 1' }] } })
    mockGet.mockResolvedValueOnce({ data: { count: 1, results: [{ id: 1, title: 'Image 1' }] } })
    
    const videosRes = await adminPhotoStudioService.listVideos()
    const imagesRes = await adminPhotoStudioService.listImages()
    
    expect(videosRes.results).toEqual([{ id: 1, title: 'Video 1' }])
    expect(videosRes.count).toBe(1)
    expect(imagesRes.results).toEqual([{ id: 1, title: 'Image 1' }])
    expect(imagesRes.count).toBe(1)
  })

  it('creates video and image', async () => {
    const fd = new FormData()
    mockPost.mockResolvedValueOnce({ data: { id: 2 } })
    mockPost.mockResolvedValueOnce({ data: { id: 3 } })

    const vRes = await adminPhotoStudioService.createVideo(fd)
    const iRes = await adminPhotoStudioService.createImage(fd)

    expect(vRes.id).toBe(2)
    expect(iRes.id).toBe(3)
  })

  it('updates video and image', async () => {
    const fd = new FormData()
    mockPatch.mockResolvedValueOnce({ data: { id: 1, title: 'Updated Video' } })
    mockPatch.mockResolvedValueOnce({ data: { id: 1, title: 'Updated Image' } })

    const vRes = await adminPhotoStudioService.updateVideo(1, fd)
    const iRes = await adminPhotoStudioService.updateImage(1, fd)

    expect(vRes.title).toBe('Updated Video')
    expect(iRes.title).toBe('Updated Image')
  })

  it('deletes video and image', async () => {
    mockDelete.mockResolvedValueOnce({ data: {} })
    mockDelete.mockResolvedValueOnce({ data: {} })

    await adminPhotoStudioService.deleteVideo(1)
    await adminPhotoStudioService.deleteImage(2)

    expect(mockDelete).toHaveBeenCalledWith('photostudio/videos/1/')
    expect(mockDelete).toHaveBeenCalledWith('photostudio/images/2/')
  })
})
