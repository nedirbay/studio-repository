import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  blogs: {
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
    blogs: m.blogs,
    uploads: m.uploads
  }
}))

import { adminBlogsService } from '../adminBlogsService'

describe('adminBlogsService', () => {
  it('list', async () => {
    expect((await adminBlogsService.list(1, 20)).length).toBe(1)
    expect(m.blogs.list).toHaveBeenCalledWith(1, 20)
  })
  it('create', async () => {
    const payload = { title: 'Test', slug: 'test', main_image: 'url', content: '', date: '', media: [] }
    expect(await adminBlogsService.create(payload)).toEqual({ id: 2 })
    expect(m.blogs.create).toHaveBeenCalledWith(payload)
  })
  it('update', async () => {
    const payload = { title: 'Updated' }
    expect(await adminBlogsService.update('test-slug', payload)).toEqual({ id: 1 })
    expect(m.blogs.update).toHaveBeenCalledWith('test-slug', payload)
  })
  it('remove', async () => {
    expect((await adminBlogsService.remove('test-slug')).deleted).toBe(true)
    expect(m.blogs.remove).toHaveBeenCalledWith('test-slug')
  })
  it('upload', async () => {
    const dummyFile = new File([''], 'test.png', { type: 'image/png' })
    expect(await adminBlogsService.upload(dummyFile)).toBe('http://image.url')
    expect(m.uploads.uploadImage).toHaveBeenCalledWith(dummyFile)
  })
})
