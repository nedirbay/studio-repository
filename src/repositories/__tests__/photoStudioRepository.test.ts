import { describe, it, expect, beforeEach } from 'vitest'
import { PhotoStudioRepository } from '../photoStudioRepository'
import { makeTestClient } from './_testClient'

let repo: PhotoStudioRepository
let mock: ReturnType<typeof makeTestClient>['mock']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  repo = new PhotoStudioRepository(t.client)
})

describe('PhotoStudioRepository', () => {
  it('listCategories returns array', async () => {
    mock.onGet('photostudio/categories/').reply(200, [{ id: 1, name: 'Wedding' }])
    expect((await repo.listCategories()).length).toBe(1)
  })

  it('listCollections passes filters', async () => {
    mock.onGet('photostudio/collections/').reply((c) => {
      expect(c.params).toEqual({ kind: 'video', category: 2 })
      return [200, [{ id: 1, title: 'A', kind: 'video' }]]
    })
    const res = await repo.listCollections({ kind: 'video', category: 2 })
    expect(res[0].title).toBe('A')
  })

  it('listCollections accepts paginated body too', async () => {
    mock.onGet('photostudio/collections/').reply(200, { results: [{ id: 9 }] })
    expect((await repo.listCollections()).length).toBe(1)
  })

  it('listReels with filters', async () => {
    mock.onGet('photostudio/reels/').reply((c) => {
      expect(c.params).toEqual({ kind: 'image' })
      return [200, [{ id: 1, kind: 'image' }]]
    })
    const res = await repo.listReels({ kind: 'image' })
    expect(res[0].kind).toBe('image')
  })

  it('registerView posts to reel/view', async () => {
    mock.onPost('photostudio/reels/3/view/').reply(200, { views: 5 })
    expect((await repo.registerView(3)).views).toBe(5)
  })

  it('toggleLike returns liked + likes_count', async () => {
    mock.onPost('photostudio/reels/3/like/').reply(200, { liked: true, likes_count: 1 })
    const res = await repo.toggleLike(3)
    expect(res.liked).toBe(true)
    expect(res.likes_count).toBe(1)
  })

  it('listComments and addComment', async () => {
    mock.onGet('photostudio/reels/3/comments/').reply(200, [])
    mock.onPost('photostudio/reels/3/comments/').reply(201, { id: 1, text: 'hi' })
    expect((await repo.listComments(3)).length).toBe(0)
    const c = await repo.addComment(3, 'hi')
    expect(c.text).toBe('hi')
    const sent = JSON.parse(mock.history.post.find(r => r.url?.includes('comments'))!.data)
    expect(sent).toEqual({ text: 'hi', parent: null })
  })

  it('shareReel sends channel', async () => {
    mock.onPost('photostudio/reels/3/share/').reply(200, { shares_count: 1 })
    await repo.shareReel(3, 'whatsapp')
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ channel: 'whatsapp' })
  })
})
