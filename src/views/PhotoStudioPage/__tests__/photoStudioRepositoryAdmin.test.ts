import { describe, it, expect, beforeEach } from 'vitest'
import { PhotoStudioRepository } from '../photoStudioRepository'
import { makeTestClient } from '../../../repositories/__tests__/_testClient'

let repo: PhotoStudioRepository
let mock: ReturnType<typeof makeTestClient>['mock']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  repo = new PhotoStudioRepository(t.client)
})

describe('PhotoStudioRepository admin endpoints', () => {
  it('creates a reel', async () => {
    mock.onPost('photostudio/reels/').reply((c) => {
      expect(JSON.parse(c.data)).toMatchObject({ title: 'A', kind: 'video' })
      return [201, { id: 5, title: 'A' }]
    })
    const res = await repo.createReel({ title: 'A', kind: 'video', media_url: 'x' })
    expect(res.id).toBe(5)
  })

  it('updates a reel via PATCH', async () => {
    mock.onPatch('photostudio/reels/5/').reply((c) => {
      expect(JSON.parse(c.data)).toEqual({ is_published: false })
      return [200, { id: 5, is_published: false }]
    })
    const res = await repo.updateReel(5, { is_published: false })
    expect(res.is_published).toBe(false)
  })

  it('deletes a reel', async () => {
    mock.onDelete('photostudio/reels/5/').reply(204)
    await expect(repo.deleteReel(5)).resolves.toBeUndefined()
  })

  it('creates a collection', async () => {
    mock.onPost('photostudio/collections/').reply(201, { id: 9, title: 'C' })
    expect((await repo.createCollection({ title: 'C', kind: 'image' })).id).toBe(9)
  })

  it('updates a collection via PATCH', async () => {
    mock.onPatch('photostudio/collections/9/').reply(200, { id: 9, title: 'C2' })
    expect((await repo.updateCollection(9, { title: 'C2' })).title).toBe('C2')
  })

  it('deletes a collection', async () => {
    mock.onDelete('photostudio/collections/9/').reply(204)
    await expect(repo.deleteCollection(9)).resolves.toBeUndefined()
  })
})
