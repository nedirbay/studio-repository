import { describe, it, expect, beforeEach } from 'vitest'
import { BlogRepository } from '../blogRepository'
import { makeTestClient } from './_testClient'

let repo: BlogRepository
let mock: ReturnType<typeof makeTestClient>['mock']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  repo = new BlogRepository(t.client)
})

describe('BlogRepository', () => {
  it('list passes page params', async () => {
    mock.onGet('blogs').reply((config) => {
      expect(config.params).toEqual({ page: 2, page_size: 5 })
      return [200, { count: 10, results: [], page: 2, page_size: 5 }]
    })
    const res = await repo.list(2, 5)
    expect(res.count).toBe(10)
  })

  it('detail GETs blogs/{slug}', async () => {
    mock.onGet('blogs/hello-world').reply(200, { id: 1, title: 'Hello' })
    expect((await repo.detail('hello-world')).title).toBe('Hello')
  })

  it('create POSTs payload', async () => {
    mock.onPost('blogs').reply(201, { id: 7 })
    const res = await repo.create({ title: 'T', main_image: '/x.jpg' })
    expect(res.id).toBe(7)
  })

  it('update PUTs and remove DELETEs', async () => {
    mock.onPut('blogs/7').reply(200, { updated: true })
    mock.onDelete('blogs/7').reply(200, { deleted: true })
    expect((await repo.update(7, { title: 'X' })).updated).toBe(true)
    expect((await repo.remove(7)).deleted).toBe(true)
  })

  it('detail surfaces 404', async () => {
    mock.onGet('blogs/missing').reply(404, { error: 'not found' })
    await expect(repo.detail('missing')).rejects.toThrow()
  })
})
